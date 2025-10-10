use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod get {
    use axum::{extract::Query, http::StatusCode};
    use serde::Deserialize;
    use shared::{
        ApiError, GetState,
        models::{
            server::{GetServer, GetServerActivityLogger},
            user::GetPermissionManager,
        },
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Deserialize)]
    pub struct Params {
        file: String,
    }

    #[utoipa::path(get, path = "/", responses(
        (status = OK, body = String),
        (status = UNAUTHORIZED, body = ApiError),
        (status = NOT_FOUND, body = ApiError),
    ), params(
        (
            "server" = uuid::Uuid,
            description = "The server ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
        (
            "file" = String, Query,
            description = "The file to retrieve contents from",
            example = "/path/to/file.txt",
        ),
    ))]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        mut server: GetServer,
        activity_logger: GetServerActivityLogger,
        Query(params): Query<Params>,
    ) -> ApiResponseResult {
        permissions.has_server_permission("files.read-content")?;

        if server.is_ignored(&params.file, false) {
            return ApiResponse::error("file not found")
                .with_status(StatusCode::NOT_FOUND)
                .ok();
        }

        let settings = state.settings.get().await;

        let contents = match server
            .node
            .fetch(&state.database)
            .await?
            .api_client(&state.database)
            .get_servers_server_files_contents(
                server.uuid,
                &params.file,
                false,
                settings.server.max_file_manager_view_size,
            )
            .await
        {
            Ok(data) => data,
            Err((StatusCode::NOT_FOUND, err)) => {
                return ApiResponse::json(ApiError::new_wings_value(err))
                    .with_status(StatusCode::NOT_FOUND)
                    .ok();
            }
            Err((StatusCode::PAYLOAD_TOO_LARGE, _)) => {
                return ApiResponse::error("file size exceeds limit")
                    .with_status(StatusCode::PAYLOAD_TOO_LARGE)
                    .ok();
            }
            Err((_, err)) => {
                tracing::error!(server = %server.uuid, "failed to get server file content: {:#?}", err);

                return ApiResponse::error("failed to get server file content")
                    .with_status(StatusCode::INTERNAL_SERVER_ERROR)
                    .ok();
            }
        };

        activity_logger
            .log(
                "server:file.read",
                serde_json::json!({
                    "file": params.file,
                }),
            )
            .await;

        ApiResponse::new(axum::body::Body::from(contents))
            .with_header("Content-Type", "text/plain")
            .ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .with_state(state.clone())
}
