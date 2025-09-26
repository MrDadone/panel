use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod get {
    use crate::{
        response::{ApiResponse, ApiResponseResult},
        routes::GetState,
    };
    use serde::Serialize;
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    struct Response<'a> {
        #[schema(inline)]
        settings: &'a crate::settings::AppSettings,
    }

    #[utoipa::path(get, path = "/", responses(
        (status = OK, body = inline(Response)),
    ))]
    pub async fn route(state: GetState) -> ApiResponseResult {
        let settings = state.settings.get().await;

        ApiResponse::json(Response {
            settings: &settings,
        })
        .ok()
    }
}

mod put {
    use crate::{
        response::{ApiResponse, ApiResponseResult},
        routes::{GetState, api::admin::GetAdminActivityLogger},
    };
    use serde::{Deserialize, Serialize};
    use utoipa::ToSchema;

    #[derive(ToSchema, Deserialize)]
    pub struct PayloadApp {
        name: Option<String>,
        url: Option<String>,
        telemetry_enabled: Option<bool>,
        registration_enabled: Option<bool>,
    }

    #[derive(ToSchema, Deserialize)]
    pub struct PayloadWebauthn {
        rp_id: Option<String>,
        rp_origin: Option<String>,
    }

    #[derive(ToSchema, Deserialize)]
    pub struct PayloadServer {
        max_file_manager_view_size: Option<u64>,
        max_schedules_step_count: Option<u64>,

        allow_overwriting_custom_docker_image: Option<bool>,
        allow_editing_startup_command: Option<bool>,
    }

    #[derive(ToSchema, Deserialize)]
    pub struct Payload {
        storage_driver: Option<crate::settings::StorageDriver>,
        mail_mode: Option<crate::settings::MailMode>,
        captcha_provider: Option<crate::settings::CaptchaProvider>,

        #[schema(inline)]
        app: Option<PayloadApp>,
        #[schema(inline)]
        webauthn: Option<PayloadWebauthn>,
        #[schema(inline)]
        server: Option<PayloadServer>,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {}

    #[utoipa::path(put, path = "/", responses(
        (status = OK, body = inline(Response)),
    ), request_body = inline(Payload))]
    pub async fn route(
        state: GetState,
        activity_logger: GetAdminActivityLogger,
        axum::Json(data): axum::Json<Payload>,
    ) -> ApiResponseResult {
        let mut settings = state.settings.get_mut().await;

        if let Some(storage_driver) = data.storage_driver {
            settings.storage_driver = storage_driver;
        }
        if let Some(mail_mode) = data.mail_mode {
            settings.mail_mode = mail_mode;
        }
        if let Some(captcha_provider) = data.captcha_provider {
            settings.captcha_provider = captcha_provider;
        }
        if let Some(app) = data.app {
            if let Some(name) = app.name {
                settings.app.name = name;
            }
            if let Some(url) = app.url {
                settings.app.url = url;
            }
            if let Some(telemetry_enabled) = app.telemetry_enabled {
                settings.app.telemetry_enabled = telemetry_enabled;
            }
            if let Some(registration_enabled) = app.registration_enabled {
                settings.app.registration_enabled = registration_enabled;
            }
        }
        if let Some(webauthn) = data.webauthn {
            if let Some(rp_id) = webauthn.rp_id {
                settings.webauthn.rp_id = rp_id;
            }
            if let Some(rp_origin) = webauthn.rp_origin {
                settings.webauthn.rp_origin = rp_origin;
            }
        }
        if let Some(server) = data.server {
            if let Some(max_file_manager_view_size) = server.max_file_manager_view_size {
                settings.server.max_file_manager_view_size = max_file_manager_view_size;
            }
            if let Some(max_schedules_step_count) = server.max_schedules_step_count {
                settings.server.max_schedules_step_count = max_schedules_step_count;
            }
            if let Some(allow_overwriting_custom_docker_image) =
                server.allow_overwriting_custom_docker_image
            {
                settings.server.allow_overwriting_custom_docker_image =
                    allow_overwriting_custom_docker_image;
            }
            if let Some(allow_editing_startup_command) = server.allow_editing_startup_command {
                settings.server.allow_editing_startup_command = allow_editing_startup_command;
            }
        }

        let settings_json = settings.censored();
        settings.save().await?;

        activity_logger.log("settings:update", settings_json).await;

        ApiResponse::json(Response {}).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .routes(routes!(put::route))
        .with_state(state.clone())
}
