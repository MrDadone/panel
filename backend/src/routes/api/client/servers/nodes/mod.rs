use super::State;
use utoipa_axum::router::OpenApiRouter;

mod _node_;

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .nest("/{node}", _node_::router(state))
        .with_state(state.clone())
}
