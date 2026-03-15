use super::{
    ExtensionSettings, SettingsDeserializeExt, SettingsDeserializer, SettingsSerializeExt,
    SettingsSerializer,
};
use compact_str::ToCompactString;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, ToSchema, Serialize, Deserialize)]
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
