use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod put {
    use axum::http::StatusCode;
    use serde::{Deserialize, Serialize};
    use shared::{
        ApiError, GetState,
        models::{server::GetServer, server_activity::ServerActivity},
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;
    use validator::Validate;

    #[derive(ToSchema, Validate, Deserialize)]
    pub struct Payload {
        schedule_uuid: Option<uuid::Uuid>,

        #[validate(length(min = 1, max = 255))]
        #[schema(min_length = 1, max_length = 255)]
        image: String,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[utoipa::path(put, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = BAD_REQUEST, body = ApiError),
        (status = UNAUTHORIZED, body = ApiError),
        (status = EXPECTATION_FAILED, body = ApiError),
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

        if !server
            .egg
            .docker_images
            .values()
            .any(|image| image == data.image)
        {
            return ApiResponse::error("the specified docker image is not available")
                .with_status(StatusCode::EXPECTATION_FAILED)
                .ok();
        }

        let settings = state.settings.get().await?;

        if !settings.server.allow_overwriting_custom_docker_image
            && !server
                .egg
                .docker_images
                .iter()
                .any(|(_, image)| image == server.image)
        {
            return ApiResponse::error("overwriting custom docker images is not allowed")
                .with_status(StatusCode::EXPECTATION_FAILED)
                .ok();
        }

        sqlx::query!(
            "UPDATE servers
            SET image = $1
            WHERE servers.uuid = $2",
            data.image,
            server.uuid
        )
        .execute(state.database.write())
        .await?;

        if let Err(err) = ServerActivity::log_remote(
            &state.database,
            server.uuid,
            None,
            data.schedule_uuid,
            "server:startup.docker-image",
            None,
            serde_json::json!({
                "image": data.image,
            }),
            chrono::Utc::now(),
        )
        .await
        {
            tracing::warn!(
                server = %server.uuid,
                "failed to log remote activity for server: {:#?}",
                err
            );
        }

        ApiResponse::new_serialized(Response {}).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(put::route))
        .with_state(state.clone())
}
