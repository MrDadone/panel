use super::State;
use utoipa_axum::router::OpenApiRouter;

mod general;

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .nest("/general", general::router(state))
        .with_state(state.clone())
}
