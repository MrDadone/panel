use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod post {
    use serde::{Deserialize, Serialize};
    use shared::{
        ApiError, GetState,
        models::server_activity::ServerActivity,
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Deserialize)]
    pub struct PayloadActivity {
        server: uuid::Uuid,
        user: Option<uuid::Uuid>,
        schedule: Option<uuid::Uuid>,
        event: String,
        metadata: Option<serde_json::Value>,

        #[schema(value_type = Option<String>)]
        ip: Option<std::net::IpAddr>,
        timestamp: chrono::DateTime<chrono::Utc>,
    }

    #[derive(ToSchema, Deserialize)]
    pub struct Payload {
        #[schema(inline)]
        data: Vec<PayloadActivity>,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[utoipa::path(post, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = EXPECTATION_FAILED, body = ApiError),
    ), request_body = inline(Payload))]
    pub async fn route(
        state: GetState,
        shared::Payload(data): shared::Payload<Payload>,
    ) -> ApiResponseResult {
        let settings = state.settings.get().await?;
        let server_log_schedule_activity = settings.activity.server_log_schedule_activity;
        drop(settings);

        for activity in data.data {
            if activity.schedule.is_some() && !server_log_schedule_activity {
                continue;
            }

            if let Err(err) = ServerActivity::log_remote(
                &state.database,
                activity.server,
                activity.user,
                activity.schedule,
                &activity.event,
                activity.ip.map(|ip| ip.into()),
                activity.metadata.unwrap_or_else(|| serde_json::json!({})),
                activity.timestamp,
            )
            .await
            {
                tracing::warn!(
                    server = %activity.server,
                    "failed to log remote activity for server: {:#?}",
                    err
                );
            }
        }

        ApiResponse::new_serialized(Response {}).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(post::route))
        .with_state(state.clone())
}
