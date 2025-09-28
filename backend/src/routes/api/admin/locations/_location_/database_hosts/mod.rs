use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod _database_host_;

mod get {
    use crate::{
        models::{
            Pagination, PaginationParamsWithSearch, location_database_host::LocationDatabaseHost,
        },
        response::{ApiResponse, ApiResponseResult},
        routes::{
            ApiError, GetState,
            api::{admin::locations::_location_::GetLocation, client::GetPermissionManager},
        },
    };
    use axum::{extract::Query, http::StatusCode};
    use serde::Serialize;
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct Response {
        #[schema(inline)]
        database_hosts:
            Pagination<crate::models::location_database_host::AdminApiLocationDatabaseHost>,
    }

    #[utoipa::path(get, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = NOT_FOUND, body = ApiError),
    ), params(
        (
            "location" = uuid::Uuid,
            description = "The location ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
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
        (
            "search" = Option<String>, Query,
            description = "Search term for items",
        ),
    ))]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        location: GetLocation,
        Query(params): Query<PaginationParamsWithSearch>,
    ) -> ApiResponseResult {
        if let Err(errors) = crate::utils::validate_data(&params) {
            return ApiResponse::json(ApiError::new_strings_value(errors))
                .with_status(StatusCode::BAD_REQUEST)
                .ok();
        }

        permissions.has_admin_permission("locations.database-hosts")?;

        let database_hosts = LocationDatabaseHost::by_location_uuid_with_pagination(
            &state.database,
            location.uuid,
            params.page,
            params.per_page,
            params.search.as_deref(),
        )
        .await?;

        ApiResponse::json(Response {
            database_hosts: Pagination {
                total: database_hosts.total,
                per_page: database_hosts.per_page,
                page: database_hosts.page,
                data: database_hosts
                    .data
                    .into_iter()
                    .map(|host| host.into_admin_api_object())
                    .collect(),
            },
        })
        .ok()
    }
}

mod post {
    use crate::{
        models::location_database_host::LocationDatabaseHost,
        response::{ApiResponse, ApiResponseResult},
        routes::{
            ApiError, GetState,
            api::{
                admin::{GetAdminActivityLogger, locations::_location_::GetLocation},
                client::GetPermissionManager,
            },
        },
    };
    use axum::http::StatusCode;
    use serde::{Deserialize, Serialize};
    use utoipa::ToSchema;

    #[derive(ToSchema, Deserialize)]
    pub struct Payload {
        database_host_uuid: uuid::Uuid,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[utoipa::path(post, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = NOT_FOUND, body = ApiError),
    ), params(
        (
            "location" = uuid::Uuid,
            description = "The location ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
    ), request_body = inline(Payload))]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        location: GetLocation,
        activity_logger: GetAdminActivityLogger,
        axum::Json(data): axum::Json<Payload>,
    ) -> ApiResponseResult {
        permissions.has_admin_permission("locations.database-hosts")?;

        match LocationDatabaseHost::create(&state.database, location.uuid, data.database_host_uuid)
            .await
        {
            Ok(_) => {}
            Err(err) if err.to_string().contains("unique constraint") => {
                return ApiResponse::error("database host already exists in this location")
                    .with_status(StatusCode::CONFLICT)
                    .ok();
            }
            Err(err) => {
                tracing::error!("failed to create location database host: {:#?}", err);

                return ApiResponse::error("failed to create location database host")
                    .with_status(StatusCode::INTERNAL_SERVER_ERROR)
                    .ok();
            }
        }

        activity_logger
            .log(
                "location:database-host.create",
                serde_json::json!({
                    "location_uuid": location.uuid,
                    "database_host_uuid": data.database_host_uuid,
                }),
            )
            .await;

        ApiResponse::json(Response {}).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .routes(routes!(post::route))
        .nest("/{database_host}", _database_host_::router(state))
        .with_state(state.clone())
}
