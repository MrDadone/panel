use super::State;
use utoipa_axum::router::OpenApiRouter;

mod command_snippets;

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .nest("/command-snippets", command_snippets::router(state))
        .with_state(state.clone())
}
