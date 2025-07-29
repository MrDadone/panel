use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod post {
    use crate::{
        response::{ApiResponse, ApiResponseResult},
        routes::{ApiError, GetState, api::client::servers::_server_::GetServer},
    };
    use axum::http::StatusCode;
    use serde::{Deserialize, Serialize};
    use utoipa::ToSchema;

    #[derive(ToSchema, Deserialize)]
    pub struct Payload {
        #[serde(default)]
        #[schema(default = "/")]
        root: String,
        query: String,

        #[serde(default)]
        #[schema(default = false)]
        content_search: bool,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {
        entries: Vec<wings_api::DirectoryEntry>,
    }

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
        mut server: GetServer,
        axum::Json(data): axum::Json<Payload>,
    ) -> ApiResponseResult {
        if let Err(error) = server.has_permission("files.create") {
            return ApiResponse::error(&error)
                .with_status(StatusCode::UNAUTHORIZED)
                .ok();
        }

        if server.is_ignored(&data.root, true) {
            return ApiResponse::error("root not found")
                .with_status(StatusCode::NOT_FOUND)
                .ok();
        }

        let request_body = wings_api::servers_server_files_search::post::RequestBody {
            root: data.root,
            query: data.query,
            include_content: data.content_search,
            max_size: None,
            limit: Some(100),
        };

        let entries = match server
            .node
            .api_client(&state.database)
            .post_servers_server_files_search(server.uuid, &request_body)
            .await
        {
            Ok(data) => data.results,
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
                tracing::error!(server = %server.uuid, "failed to search server files: {:#?}", err);

                return ApiResponse::error("failed to search server files")
                    .with_status(StatusCode::INTERNAL_SERVER_ERROR)
                    .ok();
            }
        };

        ApiResponse::json(Response { entries }).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(post::route))
        .with_state(state.clone())
}
