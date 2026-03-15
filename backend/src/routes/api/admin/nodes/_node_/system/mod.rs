use super::State;
use utoipa_axum::router::OpenApiRouter;

mod overview;

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .nest("/overview", overview::router(state))
        .with_state(state.clone())
}
