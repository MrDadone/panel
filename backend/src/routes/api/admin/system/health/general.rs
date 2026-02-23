use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod get {
    use serde::Serialize;
    use shared::{
        GetState,
        models::user::GetPermissionManager,
        response::{ApiResponse, ApiResponseResult},
    };
    use std::collections::HashMap;
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct ResponseMigrations {
        total: usize,
        applied: usize,
    }

    #[derive(ToSchema, Serialize)]
    struct Response<'a> {
        local_time: chrono::DateTime<chrono::Local>,
        #[schema(value_type = HashMap<String, shared::ntp::NtpOffset>)]
        ntp_offsets: &'a HashMap<std::net::SocketAddr, shared::ntp::NtpOffset>,

        #[schema(inline)]
        migrations: ResponseMigrations,
    }

    #[utoipa::path(get, path = "/", responses(
        (status = OK, body = inline(Response)),
    ))]
    pub async fn route(state: GetState, permissions: GetPermissionManager) -> ApiResponseResult {
        permissions.has_admin_permission("stats.read")?;

        let migrations = database_migrator::collect_embedded_migrations()?;
        let applied_migrations =
            database_migrator::fetch_applied_migrations(state.database.read()).await?;

        ApiResponse::new_serialized(Response {
            local_time: chrono::Local::now(),
            ntp_offsets: &*state.ntp.get_last_result().await,
            migrations: ResponseMigrations {
                total: migrations.len(),
                applied: applied_migrations.len(),
            },
        })
        .ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .with_state(state.clone())
}
