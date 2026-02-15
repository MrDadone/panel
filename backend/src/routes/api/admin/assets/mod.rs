use super::State;
use axum::extract::DefaultBodyLimit;
use utoipa_axum::{
    router::{OpenApiRouter, UtoipaMethodRouterExt},
    routes,
};

mod delete;

mod get {
    use axum::{extract::Query, http::StatusCode};
    use serde::Serialize;
    use shared::{
        ApiError, GetState,
        models::{Pagination, PaginationParams, user::GetPermissionManager},
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct Response {
        #[schema(inline)]
        assets: Pagination<shared::storage::StorageAsset>,
    }

    #[utoipa::path(get, path = "/", responses(
        (status = OK, body = inline(Response)),
    ), params(
        (
            "page" = i64, Query,
            description = "The page number",
            example = "1",
        ),
        (
            "per_page" = i64, Query,
            description = "The number of items per page",
            example = "10",
        ),
    ))]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        Query(params): Query<PaginationParams>,
    ) -> ApiResponseResult {
        if let Err(errors) = shared::utils::validate_data(&params) {
            return ApiResponse::new_serialized(ApiError::new_strings_value(errors))
                .with_status(StatusCode::BAD_REQUEST)
                .ok();
        }

        permissions.has_admin_permission("assets.read")?;

        let assets = state
            .storage
            .list("assets", params.page as usize, params.per_page as usize)
            .await?;

        ApiResponse::new_serialized(Response { assets }).ok()
    }
}

mod put {
    use axum::http::StatusCode;
    use compact_str::ToCompactString;
    use futures_util::TryStreamExt;
    use serde::Serialize;
    use shared::{
        ApiError, GetState,
        models::{admin_activity::GetAdminActivityLogger, user::GetPermissionManager},
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct Response {
        assets: Vec<shared::storage::StorageAsset>,
    }

    #[utoipa::path(put, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = BAD_REQUEST, body = ApiError),
    ), request_body = String)]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        activity_logger: GetAdminActivityLogger,
        mut multipart: axum::extract::Multipart,
    ) -> ApiResponseResult {
        permissions.has_admin_permission("assets.upload")?;

        let mut assets = Vec::new();

        while let Some(field) = multipart.next_field().await? {
            let filename = match field.file_name() {
                Some(name) => name.to_compact_string(),
                None => {
                    return ApiResponse::error("file name not found")
                        .with_status(StatusCode::EXPECTATION_FAILED)
                        .ok();
                }
            };
            let content_type = field
                .content_type()
                .unwrap_or("application/octet-stream")
                .to_compact_string();

            let reader = tokio_util::io::StreamReader::new(field.into_stream().map_err(|err| {
                std::io::Error::other(format!("failed to read multipart field: {err}"))
            }));

            let size = state
                .storage
                .store(format!("assets/{filename}"), reader, &content_type)
                .await?;

            activity_logger
                .log(
                    "asset:upload",
                    serde_json::json!({
                        "name": filename,
                        "size": size,
                    }),
                )
                .await;

            assets.push(shared::storage::StorageAsset {
                url: state
                    .storage
                    .retrieve_urls()
                    .await?
                    .get_url(format!("assets/{filename}")),
                name: filename,
                size,
                created: chrono::Utc::now(),
            });
        }

        ApiResponse::new_serialized(Response { assets }).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .routes(routes!(put::route).layer(DefaultBodyLimit::disable()))
        .nest("/delete", delete::router(state))
        .with_state(state.clone())
}
