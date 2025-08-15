use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod _variable_;

mod get {
    use crate::{
        models::nest_egg_variable::NestEggVariable,
        response::{ApiResponse, ApiResponseResult},
        routes::{GetState, api::admin::nests::_nest_::eggs::_egg_::GetNestEgg},
    };
    use serde::Serialize;
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct Response {
        variables: Vec<crate::models::nest_egg_variable::AdminApiNestEggVariable>,
    }

    #[utoipa::path(get, path = "/", responses(
        (status = OK, body = inline(Response)),
    ), params(
        (
            "nest" = i32,
            description = "The nest ID",
            example = "1",
        ),
        (
            "egg" = i32,
            description = "The egg ID",
            example = "1",
        ),
    ))]
    pub async fn route(state: GetState, egg: GetNestEgg) -> ApiResponseResult {
        let variables = NestEggVariable::all_by_egg_id(&state.database, egg.id).await?;

        ApiResponse::json(Response {
            variables: variables
                .into_iter()
                .map(|variable| variable.into_admin_api_object())
                .collect(),
        })
        .ok()
    }
}

mod post {
    use crate::{
        models::nest_egg_variable::NestEggVariable,
        response::{ApiResponse, ApiResponseResult},
        routes::{
            ApiError, GetState,
            api::admin::{
                GetAdminActivityLogger,
                nests::_nest_::{GetNest, eggs::_egg_::GetNestEgg},
            },
        },
    };
    use axum::http::StatusCode;
    use serde::{Deserialize, Serialize};
    use utoipa::ToSchema;
    use validator::Validate;

    #[derive(ToSchema, Validate, Deserialize)]
    pub struct Payload {
        #[validate(length(min = 3, max = 255))]
        #[schema(min_length = 3, max_length = 255)]
        name: String,
        #[validate(length(max = 1024))]
        #[schema(max_length = 1024)]
        description: Option<String>,
        order: i16,

        #[validate(length(min = 1, max = 255))]
        #[schema(min_length = 1, max_length = 255)]
        env_variable: String,
        #[validate(length(max = 1024))]
        #[schema(max_length = 1024)]
        default_value: Option<String>,

        user_viewable: bool,
        user_editable: bool,
        #[validate(custom(function = "rule_validator::validate_rules"))]
        rules: Vec<String>,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {
        variable: crate::models::nest_egg_variable::AdminApiNestEggVariable,
    }

    #[utoipa::path(post, path = "/", responses(
        (status = OK, body = inline(Response)),
        (status = BAD_REQUEST, body = ApiError),
        (status = CONFLICT, body = ApiError),
    ), params(
        (
            "nest" = i32,
            description = "The nest ID",
            example = "1",
        ),
        (
            "egg" = i32,
            description = "The egg ID",
            example = "1",
        ),
    ), request_body = inline(Payload))]
    pub async fn route(
        state: GetState,
        nest: GetNest,
        egg: GetNestEgg,
        activity_logger: GetAdminActivityLogger,
        axum::Json(data): axum::Json<Payload>,
    ) -> ApiResponseResult {
        if let Err(errors) = crate::utils::validate_data(&data) {
            return ApiResponse::json(ApiError::new_strings_value(errors))
                .with_status(StatusCode::BAD_REQUEST)
                .ok();
        }

        let egg_variable = match NestEggVariable::create(
            &state.database,
            egg.id,
            &data.name,
            data.description.as_deref(),
            data.order,
            &data.env_variable,
            data.default_value.as_deref(),
            data.user_viewable,
            data.user_editable,
            &data.rules,
        )
        .await
        {
            Ok(variable) => variable,
            Err(err) if err.to_string().contains("unique constraint") => {
                return ApiResponse::error("variable with name already exists")
                    .with_status(StatusCode::CONFLICT)
                    .ok();
            }
            Err(err) => {
                tracing::error!("failed to create variable: {:#?}", err);

                return ApiResponse::error("failed to create variable")
                    .with_status(StatusCode::INTERNAL_SERVER_ERROR)
                    .ok();
            }
        };

        activity_logger
            .log(
                "nest:egg.variable.create",
                serde_json::json!({
                    "nest_id": nest.id,
                    "egg_id": egg.id,

                    "name": egg_variable.name,
                    "description": egg_variable.description,
                    "order": egg_variable.order,

                    "env_variable": egg_variable.env_variable,
                    "default_value": egg_variable.default_value,

                    "user_viewable": egg_variable.user_viewable,
                    "user_editable": egg_variable.user_editable,
                    "rules": egg_variable.rules,
                }),
            )
            .await;

        ApiResponse::json(Response {
            variable: egg_variable.into_admin_api_object(),
        })
        .ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .routes(routes!(post::route))
        .nest("/{variable}", _variable_::router(state))
        .with_state(state.clone())
}
