use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod post {
    use axum::http::StatusCode;
    use serde::{Deserialize, Serialize};
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
    pub struct Payload {
        #[serde(default)]
        #[schema(default = "/")]
        root: String,

        name: String,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[utoipa::path(post, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = UNAUTHORIZED, body = ApiError),
        (status = NOT_FOUND, body = ApiError),
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
        permissions: GetPermissionManager,
        mut server: GetServer,
        activity_logger: GetServerActivityLogger,
        axum::Json(data): axum::Json<Payload>,
    ) -> ApiResponseResult {
        permissions.has_server_permission("files.create")?;

        if server.is_ignored(&data.root, true) {
            return ApiResponse::error("root directory not found")
                .with_status(StatusCode::NOT_FOUND)
                .ok();
        }

        if server.is_ignored(&data.name, true) {
            return ApiResponse::error("root directory not found")
                .with_status(StatusCode::NOT_FOUND)
                .ok();
        }

        let request_body = wings_api::servers_server_files_create_directory::post::RequestBody {
            path: data.root,
            name: data.name,
        };

        match server
            .node
            .fetch_cached(&state.database)
            .await?
            .api_client(&state.database)
            .post_servers_server_files_create_directory(server.uuid, &request_body)
            .await
        {
            Ok(_) => {}
            Err((StatusCode::NOT_FOUND, err)) => {
                return ApiResponse::json(ApiError::new_wings_value(err))
                    .with_status(StatusCode::NOT_FOUND)
                    .ok();
            }
            Err((StatusCode::EXPECTATION_FAILED, err)) => {
                return ApiResponse::json(ApiError::new_wings_value(err))
                    .with_status(StatusCode::EXPECTATION_FAILED)
                    .ok();
            }
            Err((_, err)) => {
                tracing::error!(server = %server.uuid, "failed to create server directory: {:#?}", err);

                return ApiResponse::error("failed to create server directory")
                    .with_status(StatusCode::INTERNAL_SERVER_ERROR)
                    .ok();
            }
        };

        activity_logger
            .log(
                "server:file.create-directory",
                serde_json::json!({
                    "directory": request_body.path,
                    "name": request_body.name,
                }),
            )
            .await;

        ApiResponse::json(Response {}).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(post::route))
        .with_state(state.clone())
}
