use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod delete {
    use crate::{
        models::location_database_host::LocationDatabaseHost,
        response::{ApiResponse, ApiResponseResult},
        routes::{
            ApiError, GetState,
            api::admin::{GetAdminActivityLogger, locations::_location_::GetLocation},
        },
    };
    use axum::{extract::Path, http::StatusCode};
    use serde::Serialize;
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[utoipa::path(delete, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = NOT_FOUND, body = ApiError),
        (status = CONFLICT, body = ApiError),
    ), params(
        (
            "location" = uuid::Uuid,
            description = "The location ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
        (
            "database_host" = uuid::Uuid,
            description = "The database host ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
    ))]
    pub async fn route(
        state: GetState,
        location: GetLocation,
        activity_logger: GetAdminActivityLogger,
        Path((_location, database_host)): Path<(uuid::Uuid, uuid::Uuid)>,
    ) -> ApiResponseResult {
        let database_host = match LocationDatabaseHost::by_location_uuid_database_host_uuid(
            &state.database,
            location.uuid,
            database_host,
        )
        .await?
        {
            Some(host) => host.database_host,
            None => {
                return ApiResponse::error("database host not found")
                    .with_status(StatusCode::NOT_FOUND)
                    .ok();
            }
        };

        LocationDatabaseHost::delete_by_uuids(&state.database, location.uuid, database_host.uuid)
            .await?;

        activity_logger
            .log(
                "location:database-host.delete",
                serde_json::json!({
                    "location_uuid": location.uuid,
                    "database_host_uuid": database_host.uuid,
                }),
            )
            .await;

        ApiResponse::json(Response {}).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(delete::route))
        .with_state(state.clone())
}
