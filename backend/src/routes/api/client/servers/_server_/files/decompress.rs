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
        file: String,

        #[serde(default)]
        foreground: bool,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[derive(ToSchema, Serialize)]
    struct ResponseAccepted {
        identifier: uuid::Uuid,
    }

    #[utoipa::path(post, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = ACCEPTED, body = inline(ResponseAccepted)),
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

        if server.is_ignored(&data.file, false) {
            return ApiResponse::error("file not found")
                .with_status(StatusCode::NOT_FOUND)
                .ok();
        }

        let request_body = wings_api::servers_server_files_decompress::post::RequestBody {
            root: data.root,
            file: data.file,
            foreground: data.foreground,
        };

        tokio::spawn(async move {
            let identifier = match server
                .node
                .fetch_cached(&state.database)
                .await?
                .api_client(&state.database)
                .post_servers_server_files_decompress(server.uuid, &request_body)
                .await
            {
                Ok(wings_api::servers_server_files_decompress::post::Response::Ok(_)) => None,
                Ok(wings_api::servers_server_files_decompress::post::Response::Accepted(data)) => {
                    Some(data.identifier)
                }
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
                    tracing::error!(server = %server.uuid, "failed to decompress server file: {:#?}", err);

                    return ApiResponse::error("failed to decompress server file")
                        .with_status(StatusCode::INTERNAL_SERVER_ERROR)
                        .ok();
                }
            };

            activity_logger
                .log(
                    "server:file.decompress",
                    serde_json::json!({
                        "directory": request_body.root,
                        "file": request_body.file,
                    }),
                )
                .await;

            if let Some(identifier) = identifier {
                ApiResponse::json(ResponseAccepted { identifier })
                    .with_status(StatusCode::ACCEPTED)
                    .ok()
            } else {
                ApiResponse::json(Response {}).ok()
            }
        }).await?
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(post::route))
        .with_state(state.clone())
}
