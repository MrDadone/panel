use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod delete {
    use crate::{
        models::user_api_key::UserApiKey,
        response::{ApiResponse, ApiResponseResult},
        routes::{
            ApiError, GetState,
            api::client::{GetPermissionManager, GetUser, GetUserActivityLogger},
        },
    };
    use axum::{extract::Path, http::StatusCode};
    use serde::Serialize;
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[utoipa::path(delete, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = FORBIDDEN, body = ApiError),
        (status = NOT_FOUND, body = ApiError),
    ), params(
        (
            "api_key" = uuid::Uuid,
            description = "The API key ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
    ))]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        user: GetUser,
        activity_logger: GetUserActivityLogger,
        Path(api_key): Path<uuid::Uuid>,
    ) -> ApiResponseResult {
        permissions.has_user_permission("api-keys.delete")?;

        let api_key =
            match UserApiKey::by_user_uuid_uuid(&state.database, user.uuid, api_key).await? {
                Some(api_key) => api_key,
                None => {
                    return ApiResponse::error("api key not found")
                        .with_status(StatusCode::NOT_FOUND)
                        .ok();
                }
            };

        UserApiKey::delete_by_uuid(&state.database, api_key.uuid).await?;

        activity_logger
            .log(
                "user:api-key.delete",
                serde_json::json!({
                    "uuid": api_key.uuid,
                    "identifier": api_key.key_start,
                    "name": api_key.name,
                }),
            )
            .await;

        ApiResponse::json(Response {}).ok()
    }
}

mod patch {
    use crate::{
        models::user_api_key::UserApiKey,
        response::{ApiResponse, ApiResponseResult},
        routes::{
            ApiError, GetState,
            api::client::{
                AuthMethod, GetAuthMethod, GetPermissionManager, GetUser, GetUserActivityLogger,
            },
        },
    };
    use axum::{extract::Path, http::StatusCode};
    use serde::{Deserialize, Serialize};
    use std::sync::Arc;
    use utoipa::ToSchema;
    use validator::Validate;

    #[derive(ToSchema, Validate, Deserialize)]
    pub struct Payload {
        #[validate(length(min = 3, max = 31))]
        #[schema(min_length = 3, max_length = 31)]
        name: Option<String>,

        #[validate(custom(function = "crate::permissions::validate_user_permissions"))]
        user_permissions: Option<Vec<String>>,
        #[validate(custom(function = "crate::permissions::validate_admin_permissions"))]
        admin_permissions: Option<Vec<String>>,
        #[validate(custom(function = "crate::permissions::validate_server_permissions"))]
        server_permissions: Option<Vec<String>>,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[utoipa::path(patch, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = BAD_REQUEST, body = ApiError),
        (status = FORBIDDEN, body = ApiError),
        (status = NOT_FOUND, body = ApiError),
        (status = CONFLICT, body = ApiError),
    ), params(
        (
            "api_key" = uuid::Uuid,
            description = "The API key identifier",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
    ), request_body = inline(Payload))]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        auth: GetAuthMethod,
        user: GetUser,
        activity_logger: GetUserActivityLogger,
        Path(api_key): Path<uuid::Uuid>,
        axum::Json(data): axum::Json<Payload>,
    ) -> ApiResponseResult {
        if let Err(errors) = crate::utils::validate_data(&data) {
            return ApiResponse::json(ApiError::new_strings_value(errors))
                .with_status(StatusCode::BAD_REQUEST)
                .ok();
        }

        permissions.has_user_permission("api-keys.update")?;

        if let AuthMethod::ApiKey(api_key) = &*auth
            && (!data
                .user_permissions
                .as_ref()
                .is_some_and(|p| p.iter().all(|p| api_key.user_permissions.contains(p)))
                || !data
                    .admin_permissions
                    .as_ref()
                    .is_some_and(|p| p.iter().all(|p| api_key.admin_permissions.contains(p)))
                || !data
                    .server_permissions
                    .as_ref()
                    .is_some_and(|p| p.iter().all(|p| api_key.server_permissions.contains(p))))
        {
            return ApiResponse::error("permissions: more permissions than self")
                .with_status(StatusCode::BAD_REQUEST)
                .ok();
        }

        let mut api_key =
            match UserApiKey::by_user_uuid_uuid(&state.database, user.uuid, api_key).await? {
                Some(api_key) => api_key,
                None => {
                    return ApiResponse::error("api key not found")
                        .with_status(StatusCode::NOT_FOUND)
                        .ok();
                }
            };

        if let Some(name) = data.name {
            api_key.name = name;
        }
        if let Some(user_permissions) = data.user_permissions {
            api_key.user_permissions = Arc::new(user_permissions);
        }
        if let Some(admin_permissions) = data.admin_permissions {
            api_key.admin_permissions = Arc::new(admin_permissions);
        }
        if let Some(server_permissions) = data.server_permissions {
            api_key.server_permissions = Arc::new(server_permissions);
        }

        match sqlx::query!(
            "UPDATE user_api_keys
            SET name = $2, user_permissions = $3, admin_permissions = $4, server_permissions = $5
            WHERE user_api_keys.uuid = $1",
            api_key.uuid,
            api_key.name,
            &*api_key.user_permissions,
            &*api_key.admin_permissions,
            &*api_key.server_permissions,
        )
        .execute(state.database.write())
        .await
        {
            Ok(_) => {}
            Err(err) if err.to_string().contains("unique constraint") => {
                return ApiResponse::error("api key with name already exists")
                    .with_status(StatusCode::CONFLICT)
                    .ok();
            }
            Err(err) => {
                tracing::error!("failed to update api key: {:#?}", err);

                return ApiResponse::error("failed to update api key")
                    .with_status(StatusCode::INTERNAL_SERVER_ERROR)
                    .ok();
            }
        }

        activity_logger
            .log(
                "user:api-key.update",
                serde_json::json!({
                    "uuid": api_key.uuid,
                    "identifier": api_key.key_start,
                    "name": api_key.name,
                    "user_permissions": api_key.user_permissions,
                    "admin_permissions": api_key.admin_permissions,
                    "server_permissions": api_key.server_permissions,
                }),
            )
            .await;

        ApiResponse::json(Response {}).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(delete::route))
        .routes(routes!(patch::route))
        .with_state(state.clone())
}
