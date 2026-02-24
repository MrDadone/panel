use super::State;
use utoipa_axum::router::OpenApiRouter;

mod resources;

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .nest("/resources", resources::router(state))
        .with_state(state.clone())
}
