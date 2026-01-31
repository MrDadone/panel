use super::State;
use utoipa_axum::router::OpenApiRouter;

mod overview;
mod telemetry;

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .nest("/overview", overview::router(state))
        .nest("/telemetry", telemetry::router(state))
        .with_state(state.clone())
}
