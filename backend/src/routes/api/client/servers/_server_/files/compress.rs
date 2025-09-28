use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod post {
    use crate::{
        response::{ApiResponse, ApiResponseResult},
        routes::{
            ApiError, GetState,
            api::client::{
                GetPermissionManager,
                servers::_server_::{GetServer, GetServerActivityLogger},
            },
        },
    };
    use axum::http::StatusCode;
    use serde::{Deserialize, Serialize};
    use utoipa::ToSchema;

    #[derive(ToSchema, Deserialize)]
    pub struct Payload {
        name: Option<String>,
        format: wings_api::ArchiveFormat,

        #[serde(default)]
        #[schema(default = "/")]
        root: String,
        files: Vec<String>,

        #[serde(default)]
        foreground: bool,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {
        entry: wings_api::DirectoryEntry,
    }

    #[derive(ToSchema, Serialize)]
    struct ResponseAccepted {
        identifier: uuid::Uuid,
    }

    #[utoipa::path(post, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = ACCEPTED, body = inline(Response)),
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
        permissions.has_server_permission("files.archive")?;

        let request_body = wings_api::servers_server_files_compress::post::RequestBody {
            name: data.name,
            format: data.format,
            root: data.root,
            files: data
                .files
                .into_iter()
                .filter(|f| !server.is_ignored(f, false))
                .collect(),
            foreground: data.foreground,
        };

        tokio::spawn(async move {
            let response = match server
                .node
                .api_client(&state.database)
                .post_servers_server_files_compress(server.uuid, &request_body)
                .await
            {
                Ok(wings_api::servers_server_files_compress::post::Response::Ok(data)) => {
                    ApiResponse::json(Response { entry: data }).ok()
                }
                Ok(wings_api::servers_server_files_compress::post::Response::Accepted(data)) => {
                    ApiResponse::json(ResponseAccepted { identifier: data.identifier })
                        .with_status(StatusCode::ACCEPTED)
                        .ok()
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
                    tracing::error!(server = %server.uuid, "failed to compress server files: {:#?}", err);

                    return ApiResponse::error("failed to compress server files")
                        .with_status(StatusCode::INTERNAL_SERVER_ERROR)
                        .ok();
                }
            };

            activity_logger
                .log(
                    "server:file.compress",
                    serde_json::json!({
                        "directory": request_body.root,
                        "name": request_body.name,
                        "files": request_body.files.iter().collect::<Vec<_>>(),
                    }),
                )
                .await;

            response
        })
        .await?
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(post::route))
        .with_state(state.clone())
}
