use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod post {
    use reqwest::StatusCode;
    use serde::{Deserialize, Serialize};
    use shared::{
        ApiError, GetState,
        models::{
            CreatableModel, server::GetServer, server_activity::ServerActivity,
            server_backup::ServerBackup,
        },
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;
    use validator::Validate;

    #[derive(ToSchema, Validate, Deserialize)]
    pub struct Payload {
        schedule_uuid: Option<uuid::Uuid>,

        #[validate(length(min = 1, max = 255))]
        #[schema(min_length = 1, max_length = 255)]
        name: Option<compact_str::CompactString>,

        ignored_files: Vec<compact_str::CompactString>,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {
        adapter: wings_api::BackupAdapter,
        uuid: uuid::Uuid,
    }

    #[utoipa::path(post, path = "/", responses(
        (status = OK, body = inline(Response)),
    ), params(
        (
            "server" = uuid::Uuid,
            description = "The server ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
    ), request_body = inline(Payload))]
    pub async fn route(
        state: GetState,
        server: GetServer,
        shared::Payload(data): shared::Payload<Payload>,
    ) -> ApiResponseResult {
        if let Err(errors) = shared::utils::validate_data(&data) {
            return ApiResponse::new_serialized(ApiError::new_strings_value(errors))
                .with_status(StatusCode::BAD_REQUEST)
                .ok();
        }

        let backups = ServerBackup::count_by_server_uuid(&state.database, server.uuid).await;
        if backups >= server.backup_limit as i64
            && let Err(err) = ServerBackup::delete_oldest_by_server_uuid(&state, &server).await
        {
            tracing::error!(server = %server.uuid, "failed to delete old backup: {:?}", err);

            return ApiResponse::error("maximum number of backups reached")
                .with_status(StatusCode::EXPECTATION_FAILED)
                .ok();
        }

        state
            .cache
            .ratelimit(
                format!("client/servers/{}/backups/create", server.uuid),
                4,
                300,
                server.uuid,
            )
            .await?;

        let options = shared::models::server_backup::CreateServerBackupOptions {
            server: &server,
            name: data.name.unwrap_or_else(ServerBackup::default_name),
            ignored_files: data.ignored_files,
        };
        let backup = match ServerBackup::create_raw(&state, options).await {
            Ok(backup) => backup,
            Err(err) => return ApiResponse::from(err).ok(),
        };

        if let Err(err) = ServerActivity::create(
            &state,
            shared::models::server_activity::CreateServerActivityOptions {
                server_uuid: server.uuid,
                user_uuid: None,
                impersonator_uuid: None,
                api_key_uuid: None,
                schedule_uuid: data.schedule_uuid,
                event: "server:backup.create".into(),
                ip: None,
                data: serde_json::json!({
                    "uuid": backup.uuid,
                    "name": backup.name,
                    "ignored_files": backup.ignored_files,
                }),
                created: None,
            },
        )
        .await
        {
            tracing::warn!(
                server = %server.uuid,
                "failed to log remote activity for server: {:#?}",
                err
            );
        }

        ApiResponse::new_serialized(Response {
            adapter: backup.disk.to_wings_adapter(),
            uuid: backup.uuid,
        })
        .ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(post::route))
        .with_state(state.clone())
}
