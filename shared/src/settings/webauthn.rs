use super::{
    ExtensionSettings, SettingsDeserializeExt, SettingsDeserializer, SettingsSerializeExt,
    SettingsSerializer,
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, ToSchema, Serialize, Deserialize)]
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
