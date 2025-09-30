use super::State;
use axum::{
    extract::{MatchedPath, Path, Request},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use shared::{
    GetState,
    models::{
        server::{Server, ServerActivityLogger, ServerStatus},
        user::{GetAuthMethod, GetPermissionManager, GetUser},
    },
    response::ApiResponse,
};
use std::sync::Arc;
use utoipa_axum::{router::OpenApiRouter, routes};

mod activity;
mod allocations;
mod backups;
mod command;
mod databases;
mod files;
mod mounts;
mod power;
mod resources;
mod schedules;
mod settings;
mod startup;
mod subusers;
mod websocket;

#[allow(clippy::too_many_arguments)]
pub async fn auth(
    state: GetState,
    user: GetUser,
    permissions: GetPermissionManager,
    auth: GetAuthMethod,
    ip: shared::GetIp,
    matched_path: MatchedPath,
    Path(server): Path<Vec<String>>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let server = Server::by_user_identifier(&state.database, &user, &server[0]).await;
    let server = match server {
        Ok(Some(server)) => server,
        Ok(None) => {
            return Ok(ApiResponse::error("server not found")
                .with_status(StatusCode::NOT_FOUND)
                .into_response());
        }
        Err(err) => return Ok(ApiResponse::from(err).into_response()),
    };

    const IGNORED_STATUS_PATHS: &[&str] = &[
        "/api/client/servers/{server}/websocket",
        "/api/client/servers/{server}",
    ];

    if !IGNORED_STATUS_PATHS.contains(&matched_path.as_str()) {
        if server.suspended {
            if !user.admin {
                return Ok(ApiResponse::error("server is suspended")
                    .with_status(StatusCode::CONFLICT)
                    .into_response());
            }
        } else if server.destination_node_uuid.is_some() {
            return Ok(ApiResponse::error("server is being transferred")
                .with_status(StatusCode::CONFLICT)
                .into_response());
        } else if let Some(status) = server.status {
            let message = match status {
                ServerStatus::Installing => "server is currently installing",
                ServerStatus::InstallFailed => "server install has failed",
                ServerStatus::ReinstallFailed => "server reinstall has failed",
                ServerStatus::RestoringBackup => "server is restoring from a backup",
            };

            return Ok(ApiResponse::error(message)
                .with_status(StatusCode::CONFLICT)
                .into_response());
        }
    }

    req.extensions_mut().insert(
        permissions
            .0
            .add_subuser_permissions(server.subuser_permissions.clone()),
    );
    req.extensions_mut().insert(ServerActivityLogger {
        state: Arc::clone(&state),
        server_uuid: server.uuid,
        user_uuid: user.uuid,
        api_key_uuid: match auth.0 {
            crate::routes::api::client::AuthMethod::ApiKey(api_key) => Some(api_key.uuid),
            _ => None,
        },
        ip: ip.0,
    });
    req.extensions_mut().insert(user.0);
    req.extensions_mut().insert(server);

    Ok(next.run(req).await)
}

mod get {
    use serde::Serialize;
    use shared::{
        models::{server::GetServer, user::GetUser},
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct Response {
        server: shared::models::server::ApiServer,
    }

    #[utoipa::path(get, path = "/", responses(
        (status = OK, body = inline(Response)),
    ), params(
        (
            "server" = uuid::Uuid,
            description = "The server ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
    ))]
    pub async fn route(user: GetUser, server: GetServer) -> ApiResponseResult {
        ApiResponse::json(Response {
            server: server.0.into_api_object(&user),
        })
        .ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .nest("/activity", activity::router(state))
        .nest("/resources", resources::router(state))
        .nest("/websocket", websocket::router(state))
        .nest("/command", command::router(state))
        .nest("/power", power::router(state))
        .nest("/files", files::router(state))
        .nest("/settings", settings::router(state))
        .nest("/startup", startup::router(state))
        .nest("/subusers", subusers::router(state))
        .nest("/backups", backups::router(state))
        .nest("/allocations", allocations::router(state))
        .nest("/databases", databases::router(state))
        .nest("/mounts", mounts::router(state))
        .nest("/schedules", schedules::router(state))
        .route_layer(axum::middleware::from_fn_with_state(state.clone(), auth))
        .with_state(state.clone())
}
