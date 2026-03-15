use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod get {
    use serde::{Deserialize, Serialize};
    use shared::{
        GetState,
        models::user::GetPermissionManager,
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Deserialize, Serialize)]
    struct ResponseVersions {
        panel: compact_str::CompactString,
        wings: compact_str::CompactString,
        fusequota: compact_str::CompactString,
    }

    #[derive(ToSchema, Deserialize, Serialize)]
    struct Response {
        #[schema(inline)]
        versions: ResponseVersions,
    }

    #[utoipa::path(get, path = "/", responses(
        (status = OK, body = inline(Response)),
    ))]
    pub async fn route(state: GetState, permissions: GetPermissionManager) -> ApiResponseResult {
        permissions.has_admin_permission("stats.read")?;

        let response = state
            .cache
            .cached("versions::latest", 30 * 60, || async {
                let data: Response = state
                    .client
                    .get("https://calagopus.com/api/latest")
                    .send()
                    .await?
                    .json()
                    .await?;

                Ok::<_, anyhow::Error>(data)
            })
            .await?;

        ApiResponse::new_serialized(response).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .with_state(state.clone())
}
