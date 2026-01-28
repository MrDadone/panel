use crate::{
    cap::CapFilesystem,
    extensions::settings::{
        ExtensionSettings, ExtensionSettingsDeserializer, SettingsDeserializeExt,
        SettingsDeserializer, SettingsSerializeExt, SettingsSerializer,
    },
    prelude::{AsyncOptionExtension, StringExt},
};
use compact_str::ToCompactString;
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
    path::PathBuf,
    str::FromStr,
    sync::{Arc, LazyLock},
};
use tokio::sync::{RwLock, RwLockReadGuard, RwLockWriteGuard};
use utoipa::ToSchema;

#[derive(ToSchema, Serialize, Deserialize, Clone, Copy)]
#[serde(rename_all = "snake_case")]
pub enum TwoFactorRequirement {
    Admins,
    AllUsers,
    None,
}

#[derive(ToSchema, Serialize, Deserialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum StorageDriver {
    Filesystem {
        path: compact_str::CompactString,
    },
    S3 {
        public_url: compact_str::CompactString,
        access_key: compact_str::CompactString,
        secret_key: compact_str::CompactString,
        bucket: compact_str::CompactString,
        region: compact_str::CompactString,
        endpoint: compact_str::CompactString,
        path_style: bool,
    },
}

impl StorageDriver {
    pub async fn get_cap_filesystem(&self) -> Option<Result<CapFilesystem, std::io::Error>> {
        match self {
            StorageDriver::Filesystem { path } => {
                Some(CapFilesystem::async_new(PathBuf::from(path)).await)
            }
            _ => None,
        }
    }
}

#[derive(ToSchema, Serialize, Deserialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum MailMode {
    None,
    Smtp {
        host: compact_str::CompactString,
        port: u16,
        username: Option<compact_str::CompactString>,
        password: Option<compact_str::CompactString>,
        use_tls: bool,

        from_address: compact_str::CompactString,
        from_name: Option<compact_str::CompactString>,
    },
    Sendmail {
        command: compact_str::CompactString,

        from_address: compact_str::CompactString,
        from_name: Option<compact_str::CompactString>,
    },
    Filesystem {
        path: compact_str::CompactString,

        from_address: compact_str::CompactString,
        from_name: Option<compact_str::CompactString>,
    },
}

#[derive(ToSchema, Serialize, Deserialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum CaptchaProvider {
    None,
    Turnstile {
        site_key: compact_str::CompactString,
        secret_key: compact_str::CompactString,
    },
    Recaptcha {
        v3: bool,
        site_key: compact_str::CompactString,
        secret_key: compact_str::CompactString,
    },
    Hcaptcha {
        site_key: compact_str::CompactString,
        secret_key: compact_str::CompactString,
    },
}

impl CaptchaProvider {
    pub fn to_public_provider<'a>(&'a self) -> PublicCaptchaProvider<'a> {
        match &self {
            CaptchaProvider::None => PublicCaptchaProvider::None,
            CaptchaProvider::Turnstile { site_key, .. } => PublicCaptchaProvider::Turnstile {
                site_key: site_key.as_str(),
            },
            CaptchaProvider::Recaptcha { v3, site_key, .. } => PublicCaptchaProvider::Recaptcha {
                v3: *v3,
                site_key: site_key.as_str(),
            },
            CaptchaProvider::Hcaptcha { site_key, .. } => PublicCaptchaProvider::Hcaptcha {
                site_key: site_key.as_str(),
            },
        }
    }
}

#[derive(ToSchema, Serialize, Deserialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PublicCaptchaProvider<'a> {
    None,
    Turnstile { site_key: &'a str },
    Recaptcha { v3: bool, site_key: &'a str },
    Hcaptcha { site_key: &'a str },
}

#[derive(ToSchema, Serialize, Deserialize)]
pub struct AppSettingsApp {
    pub name: compact_str::CompactString,
    pub url: compact_str::CompactString,
    pub language: compact_str::CompactString,
    pub two_factor_requirement: TwoFactorRequirement,

    pub telemetry_enabled: bool,
    pub registration_enabled: bool,
}

#[async_trait::async_trait]
impl SettingsSerializeExt for AppSettingsApp {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        Ok(serializer
            .write_raw_setting("name", &*self.name)
            .write_raw_setting("url", &*self.url)
            .write_raw_setting("language", &*self.language)
            .write_raw_setting(
                "two_factor_requirement",
                match self.two_factor_requirement {
                    TwoFactorRequirement::Admins => "admins",
                    TwoFactorRequirement::AllUsers => "all_users",
                    TwoFactorRequirement::None => "none",
                },
            )
            .write_raw_setting(
                "telemetry_enabled",
                self.telemetry_enabled.to_compact_string(),
            )
            .write_raw_setting(
                "registration_enabled",
                self.registration_enabled.to_compact_string(),
            ))
    }
}

pub struct AppSettingsAppDeserializer;

#[async_trait::async_trait]
impl SettingsDeserializeExt for AppSettingsAppDeserializer {
    async fn deserialize_boxed(
        &self,
        mut deserializer: SettingsDeserializer<'_>,
    ) -> Result<ExtensionSettings, anyhow::Error> {
        Ok(Box::new(AppSettingsApp {
            name: deserializer
                .take_raw_setting("name")
                .unwrap_or_else(|| "Calagopus".into()),
            url: deserializer
                .take_raw_setting("url")
                .unwrap_or_else(|| "http://localhost:8000".into()),
            language: deserializer
                .take_raw_setting("language")
                .unwrap_or_else(|| "en-US".into()),
            two_factor_requirement: match deserializer
                .take_raw_setting("two_factor_requirement")
                .as_deref()
            {
                Some("admins") => TwoFactorRequirement::Admins,
                Some("all_users") => TwoFactorRequirement::AllUsers,
                _ => TwoFactorRequirement::None,
            },
            telemetry_enabled: deserializer
                .take_raw_setting("telemetry_enabled")
                .map(|s| s == "true")
                .unwrap_or(true),
            registration_enabled: deserializer
                .take_raw_setting("registration_enabled")
                .map(|s| s == "true")
                .unwrap_or(true),
        }))
    }
}

#[derive(ToSchema, Serialize, Deserialize)]
pub struct AppSettingsWebauthn {
    pub rp_id: compact_str::CompactString,
    pub rp_origin: compact_str::CompactString,
}

#[async_trait::async_trait]
impl SettingsSerializeExt for AppSettingsWebauthn {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        Ok(serializer
            .write_raw_setting("rp_id", &*self.rp_id)
            .write_raw_setting("rp_origin", &*self.rp_origin))
    }
}

pub struct AppSettingsWebauthnDeserializer;

#[async_trait::async_trait]
impl SettingsDeserializeExt for AppSettingsWebauthnDeserializer {
    async fn deserialize_boxed(
        &self,
        mut deserializer: SettingsDeserializer<'_>,
    ) -> Result<ExtensionSettings, anyhow::Error> {
        Ok(Box::new(AppSettingsWebauthn {
            rp_id: deserializer
                .take_raw_setting("rp_id")
                .unwrap_or_else(|| "localhost".into()),
            rp_origin: deserializer
                .take_raw_setting("rp_origin")
                .unwrap_or_else(|| "http://localhost".into()),
        }))
    }
}

#[derive(ToSchema, Serialize, Deserialize)]
pub struct AppSettingsServer {
    pub max_file_manager_view_size: u64,
    pub max_file_manager_content_search_size: u64,
    pub max_file_manager_search_results: u64,
    pub max_schedules_step_count: u64,

    pub allow_overwriting_custom_docker_image: bool,
    pub allow_editing_startup_command: bool,
}

#[async_trait::async_trait]
impl SettingsSerializeExt for AppSettingsServer {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        Ok(serializer
            .write_raw_setting(
                "max_file_manager_view_size",
                self.max_file_manager_view_size.to_compact_string(),
            )
            .write_raw_setting(
                "max_file_manager_content_search_size",
                self.max_file_manager_content_search_size
                    .to_compact_string(),
            )
            .write_raw_setting(
                "max_file_manager_search_results",
                self.max_file_manager_search_results.to_compact_string(),
            )
            .write_raw_setting(
                "max_schedules_step_count",
                self.max_schedules_step_count.to_compact_string(),
            )
            .write_raw_setting(
                "allow_overwriting_custom_docker_image",
                self.allow_overwriting_custom_docker_image
                    .to_compact_string(),
            )
            .write_raw_setting(
                "allow_editing_startup_command",
                self.allow_editing_startup_command.to_compact_string(),
            ))
    }
}

pub struct AppSettingsServerDeserializer;

#[async_trait::async_trait]
impl SettingsDeserializeExt for AppSettingsServerDeserializer {
    async fn deserialize_boxed(
        &self,
        mut deserializer: SettingsDeserializer<'_>,
    ) -> Result<ExtensionSettings, anyhow::Error> {
        Ok(Box::new(AppSettingsServer {
            max_file_manager_view_size: deserializer
                .take_raw_setting("max_file_manager_view_size")
                .and_then(|s| s.parse().ok())
                .unwrap_or(10 * 1024 * 1024),
            max_file_manager_content_search_size: deserializer
                .take_raw_setting("max_file_manager_content_search_size")
                .and_then(|s| s.parse().ok())
                .unwrap_or(5 * 1024 * 1024),
            max_file_manager_search_results: deserializer
                .take_raw_setting("max_file_manager_search_results")
                .and_then(|s| s.parse().ok())
                .unwrap_or(100),
            max_schedules_step_count: deserializer
                .take_raw_setting("max_schedules_step_count")
                .and_then(|s| s.parse().ok())
                .unwrap_or(100),
            allow_overwriting_custom_docker_image: deserializer
                .take_raw_setting("allow_overwriting_custom_docker_image")
                .map(|s| s == "true")
                .unwrap_or(true),
            allow_editing_startup_command: deserializer
                .take_raw_setting("allow_editing_startup_command")
                .map(|s| s == "true")
                .unwrap_or(false),
        }))
    }
}

#[derive(ToSchema, Serialize, Deserialize)]
pub struct AppSettingsActivity {
    pub admin_log_retention_days: u16,
    pub user_log_retention_days: u16,
    pub server_log_retention_days: u16,

    pub server_log_admin_activity: bool,
    pub server_log_schedule_activity: bool,
}

#[async_trait::async_trait]
impl SettingsSerializeExt for AppSettingsActivity {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        Ok(serializer
            .write_raw_setting(
                "admin_log_retention_days",
                self.admin_log_retention_days.to_compact_string(),
            )
            .write_raw_setting(
                "user_log_retention_days",
                self.user_log_retention_days.to_compact_string(),
            )
            .write_raw_setting(
                "server_log_retention_days",
                self.server_log_retention_days.to_compact_string(),
            )
            .write_raw_setting(
                "server_log_admin_activity",
                self.server_log_admin_activity.to_compact_string(),
            )
            .write_raw_setting(
                "server_log_schedule_activity",
                self.server_log_schedule_activity.to_compact_string(),
            ))
    }
}

pub struct AppSettingsActivityDeserializer;

#[async_trait::async_trait]
impl SettingsDeserializeExt for AppSettingsActivityDeserializer {
    async fn deserialize_boxed(
        &self,
        mut deserializer: SettingsDeserializer<'_>,
    ) -> Result<ExtensionSettings, anyhow::Error> {
        Ok(Box::new(AppSettingsActivity {
            admin_log_retention_days: deserializer
                .take_raw_setting("admin_log_retention_days")
                .and_then(|s| s.parse().ok())
                .unwrap_or(180),
            user_log_retention_days: deserializer
                .take_raw_setting("user_log_retention_days")
                .and_then(|s| s.parse().ok())
                .unwrap_or(180),
            server_log_retention_days: deserializer
                .take_raw_setting("server_log_retention_days")
                .and_then(|s| s.parse().ok())
                .unwrap_or(90),
            server_log_admin_activity: deserializer
                .take_raw_setting("server_log_admin_activity")
                .map(|s| s == "true")
                .unwrap_or(true),
            server_log_schedule_activity: deserializer
                .take_raw_setting("server_log_schedule_activity")
                .map(|s| s == "true")
                .unwrap_or(true),
        }))
    }
}

#[derive(ToSchema, Serialize, Deserialize)]
pub struct AppSettings {
    pub telemetry_uuid: Option<uuid::Uuid>,
    #[schema(value_type = Option<String>)]
    pub telemetry_cron_schedule: Option<cron::Schedule>,
    pub oobe_step: Option<compact_str::CompactString>,

    pub storage_driver: StorageDriver,
    pub mail_mode: MailMode,
    pub captcha_provider: CaptchaProvider,

    #[schema(inline)]
    pub app: AppSettingsApp,
    #[schema(inline)]
    pub webauthn: AppSettingsWebauthn,
    #[schema(inline)]
    pub server: AppSettingsServer,
    #[schema(inline)]
    pub activity: AppSettingsActivity,

    #[serde(skip)]
    pub extensions: HashMap<&'static str, ExtensionSettings>,
}

impl AppSettings {
    pub fn get_extension_settings<T: 'static>(
        &self,
        ext_identifier: &str,
    ) -> Result<&T, anyhow::Error> {
        let ext_settings = self
            .extensions
            .get(ext_identifier)
            .ok_or_else(|| anyhow::anyhow!("failed to find extension settings"))?;

        ext_settings
            .as_any_ref()
            .downcast_ref::<T>()
            .ok_or_else(|| anyhow::anyhow!("failed to downcast extension settings"))
    }

    pub fn get_mut_extension_settings<T: 'static>(
        &mut self,
        ext_identifier: &str,
    ) -> Result<&mut T, anyhow::Error> {
        let ext_settings = self
            .extensions
            .get_mut(ext_identifier)
            .ok_or_else(|| anyhow::anyhow!("failed to find extension settings"))?;

        ext_settings
            .as_any_mut_ref()
            .downcast_mut::<T>()
            .ok_or_else(|| anyhow::anyhow!("failed to downcast extension settings"))
    }

    pub fn find_extension_settings<T: 'static>(&self) -> Result<&T, anyhow::Error> {
        for ext_settings in self.extensions.values() {
            if let Some(downcasted) = ext_settings.as_any_ref().downcast_ref::<T>() {
                return Ok(downcasted);
            }
        }

        Err(anyhow::anyhow!("failed to find extension settings"))
    }

    pub fn find_mut_extension_settings<T: 'static>(&mut self) -> Result<&mut T, anyhow::Error> {
        for ext_settings in self.extensions.values_mut() {
            if let Some(downcasted) = ext_settings.as_any_mut_ref().downcast_mut::<T>() {
                return Ok(downcasted);
            }
        }

        Err(anyhow::anyhow!("failed to find extension settings"))
    }
}

#[async_trait::async_trait]
impl SettingsSerializeExt for AppSettings {
    async fn serialize(
        &self,
        mut serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        let database = serializer.database.clone();

        serializer = serializer
            .write_raw_setting(
                "telemetry_uuid",
                self.telemetry_uuid
                    .as_ref()
                    .map(|u| u.to_compact_string())
                    .unwrap_or_default(),
            )
            .write_raw_setting(
                "telemetry_cron_schedule",
                self.telemetry_cron_schedule
                    .as_ref()
                    .map(|s| s.to_compact_string())
                    .unwrap_or_default(),
            )
            .write_raw_setting("oobe_step", self.oobe_step.clone().unwrap_or_default());

        match &self.storage_driver {
            StorageDriver::Filesystem { path } => {
                serializer = serializer
                    .write_raw_setting("storage_driver", "filesystem")
                    .write_raw_setting("storage_filesystem_path", &**path);
            }
            StorageDriver::S3 {
                public_url,
                access_key,
                secret_key,
                bucket,
                region,
                endpoint,
                path_style,
            } => {
                serializer = serializer
                    .write_raw_setting("storage_driver", "s3")
                    .write_raw_setting("storage_s3_public_url", &**public_url)
                    .write_raw_setting(
                        "storage_s3_access_key",
                        base32::encode(
                            base32::Alphabet::Z,
                            &database.encrypt(access_key.clone()).await?,
                        ),
                    )
                    .write_raw_setting(
                        "storage_s3_secret_key",
                        base32::encode(
                            base32::Alphabet::Z,
                            &database.encrypt(secret_key.clone()).await?,
                        ),
                    )
                    .write_raw_setting("storage_s3_bucket", &**bucket)
                    .write_raw_setting("storage_s3_region", &**region)
                    .write_raw_setting("storage_s3_endpoint", &**endpoint)
                    .write_raw_setting("storage_s3_path_style", path_style.to_compact_string());
            }
        }

        match &self.mail_mode {
            MailMode::None => {
                serializer = serializer.write_raw_setting("mail_mode", "none");
            }
            MailMode::Smtp {
                host,
                port,
                username,
                password,
                use_tls,
                from_address,
                from_name,
            } => {
                serializer = serializer
                    .write_raw_setting("mail_mode", "smtp")
                    .write_raw_setting("mail_smtp_host", &**host)
                    .write_raw_setting("mail_smtp_port", port.to_compact_string())
                    .write_raw_setting(
                        "mail_smtp_username",
                        if let Some(u) = username {
                            base32::encode(base32::Alphabet::Z, &database.encrypt(u.clone()).await?)
                        } else {
                            "".into()
                        },
                    )
                    .write_raw_setting(
                        "mail_smtp_password",
                        if let Some(p) = password {
                            base32::encode(base32::Alphabet::Z, &database.encrypt(p.clone()).await?)
                        } else {
                            "".into()
                        },
                    )
                    .write_raw_setting("mail_smtp_use_tls", use_tls.to_compact_string())
                    .write_raw_setting("mail_smtp_from_address", &**from_address)
                    .write_raw_setting(
                        "mail_smtp_from_name",
                        from_name.clone().unwrap_or_default(),
                    );
            }
            MailMode::Sendmail {
                command,
                from_address,
                from_name,
            } => {
                serializer = serializer
                    .write_raw_setting("mail_mode", "sendmail")
                    .write_raw_setting("mail_sendmail_command", &**command)
                    .write_raw_setting("mail_sendmail_from_address", &**from_address)
                    .write_raw_setting(
                        "mail_sendmail_from_name",
                        from_name.clone().unwrap_or_default(),
                    );
            }
            MailMode::Filesystem {
                path,
                from_address,
                from_name,
            } => {
                serializer = serializer
                    .write_raw_setting("mail_mode", "filesystem")
                    .write_raw_setting("mail_filesystem_path", &**path)
                    .write_raw_setting("mail_filesystem_from_address", &**from_address)
                    .write_raw_setting(
                        "mail_filesystem_from_name",
                        from_name.clone().unwrap_or_default(),
                    );
            }
        }

        match &self.captcha_provider {
            CaptchaProvider::None => {
                serializer = serializer.write_raw_setting("captcha_provider", "none");
            }
            CaptchaProvider::Turnstile {
                site_key,
                secret_key,
            } => {
                serializer = serializer
                    .write_raw_setting("captcha_provider", "turnstile")
                    .write_raw_setting("turnstile_site_key", &**site_key)
                    .write_raw_setting("turnstile_secret_key", &**secret_key);
            }
            CaptchaProvider::Recaptcha {
                v3,
                site_key,
                secret_key,
            } => {
                serializer = serializer
                    .write_raw_setting("captcha_provider", "recaptcha")
                    .write_raw_setting("recaptcha_v3", v3.to_compact_string())
                    .write_raw_setting("recaptcha_site_key", &**site_key)
                    .write_raw_setting("recaptcha_secret_key", &**secret_key);
            }
            CaptchaProvider::Hcaptcha {
                site_key,
                secret_key,
            } => {
                serializer = serializer
                    .write_raw_setting("captcha_provider", "hcaptcha")
                    .write_raw_setting("hcaptcha_site_key", &**site_key)
                    .write_raw_setting("hcaptcha_secret_key", &**secret_key);
            }
        }

        serializer = serializer
            .nest("app", &self.app)
            .await?
            .nest("webauthn", &self.webauthn)
            .await?
            .nest("server", &self.server)
            .await?
            .nest("activity", &self.activity)
            .await?;

        for (ext_identifier, ext_settings) in &self.extensions {
            serializer = serializer.nest(ext_identifier, ext_settings).await?;
        }

        Ok(serializer)
    }
}

pub(crate) static SETTINGS_DESER_EXTENSIONS: LazyLock<
    std::sync::RwLock<HashMap<&'static str, ExtensionSettingsDeserializer>>,
> = LazyLock::new(|| std::sync::RwLock::new(HashMap::new()));

pub struct AppSettingsDeserializer;

#[async_trait::async_trait]
impl SettingsDeserializeExt for AppSettingsDeserializer {
    async fn deserialize_boxed(
        &self,
        mut deserializer: SettingsDeserializer<'_>,
    ) -> Result<ExtensionSettings, anyhow::Error> {
        let mut extensions = HashMap::new();

        let extension_deserializers = {
            let ext_deser_lock = SETTINGS_DESER_EXTENSIONS.read().unwrap();

            ext_deser_lock
                .iter()
                .map(|(k, v)| (*k, v.clone()))
                .collect::<Vec<_>>()
        };

        for (ext_identifier, ext_deserializer) in extension_deserializers {
            let settings_deserializer = SettingsDeserializer::new(
                deserializer.database.clone(),
                deserializer.nest_prefix(ext_identifier),
                deserializer.settings,
            );

            let ext_settings = ext_deserializer
                .deserialize_boxed(settings_deserializer)
                .await?;
            extensions.insert(ext_identifier, ext_settings);
        }

        Ok(Box::new(AppSettings {
            telemetry_uuid: deserializer
                .take_raw_setting("telemetry_uuid")
                .and_then(|s| uuid::Uuid::from_str(&s).ok()),
            telemetry_cron_schedule: deserializer
                .take_raw_setting("telemetry_cron_schedule")
                .and_then(|s| cron::Schedule::from_str(&s).ok()),
            oobe_step: match deserializer.take_raw_setting("oobe_step") {
                Some(step) if step.is_empty() => None,
                Some(step) => Some(step),
                None => {
                    if crate::models::user::User::count(&deserializer.database).await > 0 {
                        None
                    } else {
                        Some("register".into())
                    }
                }
            },
            storage_driver: match deserializer.take_raw_setting("storage_driver").as_deref() {
                Some("s3") => StorageDriver::S3 {
                    public_url: deserializer
                        .take_raw_setting("storage_s3_public_url")
                        .unwrap_or_else(|| "https://your-s3-bucket.s3.amazonaws.com".into()),
                    access_key: if let Some(access_key) =
                        deserializer.take_raw_setting("storage_s3_access_key")
                    {
                        base32::decode(base32::Alphabet::Z, &access_key)
                            .map(|encrypted| deserializer.database.decrypt(encrypted))
                            .awaited()
                            .await
                            .transpose()?
                            .unwrap_or_else(|| "your-access-key".into())
                    } else {
                        "your-access-key".into()
                    },
                    secret_key: if let Some(secret_key) =
                        deserializer.take_raw_setting("storage_s3_secret_key")
                    {
                        base32::decode(base32::Alphabet::Z, &secret_key)
                            .map(|encrypted| deserializer.database.decrypt(encrypted))
                            .awaited()
                            .await
                            .transpose()?
                            .unwrap_or_else(|| "your-secret-key".into())
                    } else {
                        "your-secret-key".into()
                    },
                    bucket: deserializer
                        .take_raw_setting("storage_s3_bucket")
                        .unwrap_or_else(|| "your-s3-bucket".into()),
                    region: deserializer
                        .take_raw_setting("storage_s3_region")
                        .unwrap_or_else(|| "us-east-1".into()),
                    endpoint: deserializer
                        .take_raw_setting("storage_s3_endpoint")
                        .unwrap_or_else(|| "https://s3.amazonaws.com".into()),
                    path_style: deserializer
                        .take_raw_setting("storage_s3_path_style")
                        .map(|s| s == "true")
                        .unwrap_or(false),
                },
                _ => StorageDriver::Filesystem {
                    path: deserializer
                        .take_raw_setting("storage_filesystem_path")
                        .unwrap_or_else(|| {
                            if std::env::consts::OS == "windows" {
                                "C:\\calagopus_data".into()
                            } else {
                                "/var/lib/calagopus".into()
                            }
                        }),
                },
            },
            mail_mode: match deserializer.take_raw_setting("mail_mode").as_deref() {
                Some("smtp") => MailMode::Smtp {
                    host: deserializer
                        .take_raw_setting("mail_smtp_host")
                        .unwrap_or_else(|| "smtp.example.com".into()),
                    port: deserializer
                        .take_raw_setting("mail_smtp_port")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(587),
                    username: if let Some(username) = deserializer
                        .take_raw_setting("mail_smtp_username")
                        .and_then(|s| s.into_optional())
                    {
                        base32::decode(base32::Alphabet::Z, &username)
                            .map(|encrypted| deserializer.database.decrypt(encrypted))
                            .awaited()
                            .await
                            .transpose()?
                    } else {
                        None
                    },
                    password: if let Some(password) = deserializer
                        .take_raw_setting("mail_smtp_password")
                        .and_then(|s| s.into_optional())
                    {
                        base32::decode(base32::Alphabet::Z, &password)
                            .map(|encrypted| deserializer.database.decrypt(encrypted))
                            .awaited()
                            .await
                            .transpose()?
                    } else {
                        None
                    },
                    use_tls: deserializer
                        .take_raw_setting("mail_smtp_use_tls")
                        .map(|s| s == "true")
                        .unwrap_or(true),
                    from_address: deserializer
                        .take_raw_setting("mail_smtp_from_address")
                        .unwrap_or_else(|| "noreply@example.com".into()),
                    from_name: deserializer.take_raw_setting("mail_smtp_from_name"),
                },
                Some("sendmail") => MailMode::Sendmail {
                    command: deserializer
                        .take_raw_setting("mail_sendmail_command")
                        .unwrap_or_else(|| "sendmail".into()),
                    from_address: deserializer
                        .take_raw_setting("mail_sendmail_from_address")
                        .unwrap_or_else(|| "noreply@example.com".into()),
                    from_name: deserializer.take_raw_setting("mail_sendmail_from_name"),
                },
                Some("filesystem") => MailMode::Filesystem {
                    path: deserializer
                        .take_raw_setting("mail_filesystem_path")
                        .unwrap_or_else(|| "/var/lib/calagopus/mail".into()),
                    from_address: deserializer
                        .take_raw_setting("mail_filesystem_from_address")
                        .unwrap_or_else(|| "noreply@example.com".into()),
                    from_name: deserializer.take_raw_setting("mail_filesystem_from_name"),
                },
                _ => MailMode::None,
            },
            captcha_provider: match deserializer.take_raw_setting("captcha_provider").as_deref() {
                Some("turnstile") => CaptchaProvider::Turnstile {
                    site_key: deserializer
                        .take_raw_setting("turnstile_site_key")
                        .unwrap_or_default(),
                    secret_key: deserializer
                        .take_raw_setting("turnstile_secret_key")
                        .unwrap_or_default(),
                },
                Some("recaptcha") => CaptchaProvider::Recaptcha {
                    v3: deserializer
                        .take_raw_setting("recaptcha_v3")
                        .map(|s| s == "true")
                        .unwrap_or(false),
                    site_key: deserializer
                        .take_raw_setting("recaptcha_site_key")
                        .unwrap_or_default(),
                    secret_key: deserializer
                        .take_raw_setting("recaptcha_secret_key")
                        .unwrap_or_default(),
                },
                Some("hcaptcha") => CaptchaProvider::Hcaptcha {
                    site_key: deserializer
                        .take_raw_setting("hcaptcha_site_key")
                        .unwrap_or_default(),
                    secret_key: deserializer
                        .take_raw_setting("hcaptcha_secret_key")
                        .unwrap_or_default(),
                },
                _ => CaptchaProvider::None,
            },
            app: deserializer
                .nest("app", &AppSettingsAppDeserializer)
                .await?,
            webauthn: deserializer
                .nest("webauthn", &AppSettingsWebauthnDeserializer)
                .await?,
            server: deserializer
                .nest("server", &AppSettingsServerDeserializer)
                .await?,
            activity: deserializer
                .nest("activity", &AppSettingsActivityDeserializer)
                .await?,
            extensions,
        }))
    }
}

pub struct SettingsGuard<'a> {
    database: Arc<crate::database::Database>,
    settings: RwLockWriteGuard<'a, AppSettings>,
}

impl<'a> SettingsGuard<'a> {
    pub async fn save(self) -> Result<(), crate::database::DatabaseError> {
        let (keys, values) = SettingsSerializeExt::serialize(
            &*self.settings,
            SettingsSerializer::new(self.database.clone(), ""),
        )
        .await?
        .into_parts();
        drop(self.settings);

        sqlx::query!(
            "INSERT INTO settings (key, value)
            SELECT * FROM UNNEST($1::text[], $2::text[])
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
            &keys as &[compact_str::CompactString],
            &values as &[compact_str::CompactString]
        )
        .execute(self.database.write())
        .await?;

        Ok(())
    }

    pub fn censored(&self) -> serde_json::Value {
        let mut json = serde_json::to_value(&*self.settings).unwrap();

        fn censor_values(key: &str, value: &mut serde_json::Value) {
            match value {
                serde_json::Value::Object(map) => {
                    for (k, v) in map.iter_mut() {
                        censor_values(k, v);
                    }
                }
                serde_json::Value::String(s) => {
                    if key.contains("password") {
                        *s = "*".repeat(s.len());
                    }
                }
                _ => {}
            }
        }

        censor_values("", &mut json);

        json
    }
}

impl Deref for SettingsGuard<'_> {
    type Target = AppSettings;

    fn deref(&self) -> &Self::Target {
        &self.settings
    }
}

impl DerefMut for SettingsGuard<'_> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.settings
    }
}

pub struct Settings {
    cached: RwLock<AppSettings>,
    cached_expires: RwLock<std::time::Instant>,

    database: Arc<crate::database::Database>,
}

impl Settings {
    async fn fetch_setttings(
        database: &Arc<crate::database::Database>,
    ) -> Result<AppSettings, anyhow::Error> {
        let rows = sqlx::query!("SELECT * FROM settings")
            .fetch_all(database.read())
            .await
            .expect("failed to fetch settings");

        let mut map = HashMap::new();
        for row in rows {
            map.insert(row.key.into(), row.value.into());
        }

        let boxed = SettingsDeserializeExt::deserialize_boxed(
            &AppSettingsDeserializer,
            SettingsDeserializer::new(database.clone(), "", &mut map),
        )
        .await?;

        Ok(*boxed
            .as_any_boxed()
            .downcast::<AppSettings>()
            .expect("settings has invalid type"))
    }

    pub async fn new(database: Arc<crate::database::Database>) -> Result<Self, anyhow::Error> {
        let cached = RwLock::new(Self::fetch_setttings(&database).await?);
        let cached_expires =
            RwLock::new(std::time::Instant::now() + std::time::Duration::from_secs(60));

        Ok(Self {
            cached,
            cached_expires,
            database,
        })
    }

    pub async fn get(&self) -> Result<RwLockReadGuard<'_, AppSettings>, anyhow::Error> {
        let now = std::time::Instant::now();
        let cached_expires = self.cached_expires.read().await;

        if now >= *cached_expires {
            drop(cached_expires);

            let settings = Self::fetch_setttings(&self.database).await?;

            *self.cached.write().await = settings;
            *self.cached_expires.write().await = now + std::time::Duration::from_secs(60);
        }

        Ok(self.cached.read().await)
    }

    pub async fn get_webauthn(&self) -> Result<webauthn_rs::Webauthn, anyhow::Error> {
        let settings = self.get().await?;

        Ok(webauthn_rs::WebauthnBuilder::new(
            &settings.webauthn.rp_id,
            &settings.webauthn.rp_origin.parse()?,
        )?
        .rp_name(&settings.app.name)
        .build()?)
    }

    pub async fn get_mut(&self) -> Result<SettingsGuard<'_>, anyhow::Error> {
        let now = std::time::Instant::now();

        let is_expired = {
            let guard = self.cached_expires.read().await;
            now >= *guard
        };

        if is_expired {
            let settings = Self::fetch_setttings(&self.database).await?;
            *self.cached.write().await = settings;
            *self.cached_expires.write().await = now + std::time::Duration::from_secs(60);
        }

        Ok(SettingsGuard {
            database: Arc::clone(&self.database),
            settings: self.cached.write().await,
        })
    }

    pub async fn invalidate_cache(&self) {
        *self.cached_expires.write().await = std::time::Instant::now();
    }
}
