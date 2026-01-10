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
        file: compact_str::CompactString,
        destination: Option<compact_str::CompactString>,

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

        if let Some(destination) = &data.destination
            && server.is_ignored(destination, false)
        {
            return ApiResponse::error("file not found")
                .with_status(StatusCode::NOT_FOUND)
                .ok();
        }

        let request_body = wings_api::servers_server_files_copy::post::RequestBody {
            location: data.file,
            name: data.destination,
            foreground: data.foreground,
        };

        tokio::spawn(async move {
            let response = match server
                .node
                .fetch_cached(&state.database)
                .await?
                .api_client(&state.database)
                .post_servers_server_files_copy(server.uuid, &request_body)
                .await
            {
                Ok(wings_api::servers_server_files_copy::post::Response::Ok(data)) => {
                    ApiResponse::json(Response { entry: data }).ok()
                }
                Ok(wings_api::servers_server_files_copy::post::Response::Accepted(data)) => {
                    ApiResponse::json(ResponseAccepted {
                        identifier: data.identifier,
                    })
                    .with_status(StatusCode::ACCEPTED)
                    .ok()
                }
                Err(wings_api::client::ApiHttpError::Http(StatusCode::NOT_FOUND, err)) => {
                    return ApiResponse::json(ApiError::new_wings_value(err))
                        .with_status(StatusCode::NOT_FOUND)
                        .ok();
                }
                Err(wings_api::client::ApiHttpError::Http(StatusCode::EXPECTATION_FAILED, err)) => {
                    return ApiResponse::json(ApiError::new_wings_value(err))
                        .with_status(StatusCode::EXPECTATION_FAILED)
                        .ok();
                }
                Err(err) => return Err(err.into()),
            };

            activity_logger
                .log(
                    "server:file.copy",
                    serde_json::json!({
                        "file": request_body.location,
                        "name": request_body.name.as_ref(),
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
