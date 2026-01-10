use std::{collections::HashMap, sync::Arc};

pub struct SettingsSerializer {
    pub database: Arc<crate::database::Database>,

    prefix: compact_str::CompactString,
    keys: Vec<compact_str::CompactString>,
    values: Vec<compact_str::CompactString>,
}

impl SettingsSerializer {
    pub(crate) fn new(
        database: Arc<crate::database::Database>,
        prefix: impl Into<compact_str::CompactString>,
    ) -> Self {
        Self {
            database,
            prefix: prefix.into(),
            keys: Vec::new(),
            values: Vec::new(),
        }
    }

    pub(crate) fn key_prefix(&self, key: impl AsRef<str>) -> compact_str::CompactString {
        compact_str::format_compact!("{}::{}", self.prefix, key.as_ref())
    }

    pub(crate) fn nest_prefix(&self, nested_prefix: &str) -> compact_str::CompactString {
        compact_str::format_compact!(
            "{}{}{}",
            self.prefix,
            if self.prefix.is_empty() { "" } else { "::" },
            nested_prefix
        )
    }

    pub fn write_raw_setting(
        mut self,
        key: impl AsRef<str>,
        value: impl Into<compact_str::CompactString>,
    ) -> Self {
        self.keys.push(self.key_prefix(key));
        self.values.push(value.into());

        self
    }

    pub fn write_serde_setting(
        mut self,
        key: impl AsRef<str>,
        value: &impl serde::Serialize,
    ) -> Result<Self, serde_json::Error> {
        let serialized = serde_json::to_string(value)?;
        self.keys.push(self.key_prefix(key));
        self.values
            .push(compact_str::CompactString::from(serialized));

        Ok(self)
    }

    pub async fn nest(
        mut self,
        nested_prefix: &str,
        settings: &impl SettingsSerializeExt,
    ) -> Result<Self, anyhow::Error> {
        let serializer = Self::new(self.database.clone(), self.nest_prefix(nested_prefix));

        let nested_serializer = settings.serialize(serializer).await?;

        self.keys.extend(nested_serializer.keys);
        self.values.extend(nested_serializer.values);

        Ok(self)
    }

    pub fn merge(mut self, other: SettingsSerializer) -> Self {
        self.keys.extend(other.keys);
        self.values.extend(other.values);

        self
    }

    pub(crate) fn into_parts(
        self,
    ) -> (
        Vec<compact_str::CompactString>,
        Vec<compact_str::CompactString>,
    ) {
        (self.keys, self.values)
    }
}

pub struct SettingsDeserializer<'a> {
    pub database: Arc<crate::database::Database>,

    pub(crate) prefix: compact_str::CompactString,
    pub(crate) settings: &'a mut HashMap<compact_str::CompactString, compact_str::CompactString>,
}

impl<'a> SettingsDeserializer<'a> {
    pub(crate) fn new(
        database: Arc<crate::database::Database>,
        prefix: impl Into<compact_str::CompactString>,
        settings: &'a mut HashMap<compact_str::CompactString, compact_str::CompactString>,
    ) -> Self {
        Self {
            database,
            prefix: prefix.into(),
            settings,
        }
    }

    pub(crate) fn key_prefix(&self, key: impl AsRef<str>) -> compact_str::CompactString {
        compact_str::format_compact!("{}::{}", self.prefix, key.as_ref())
    }

    pub(crate) fn nest_prefix(&self, nested_prefix: &str) -> compact_str::CompactString {
        compact_str::format_compact!(
            "{}{}{}",
            self.prefix,
            if self.prefix.is_empty() { "" } else { "::" },
            nested_prefix
        )
    }

    pub fn read_raw_setting(&self, key: impl AsRef<str>) -> Option<&compact_str::CompactString> {
        self.settings.get(&self.key_prefix(key))
    }

    pub fn take_raw_setting(&mut self, key: impl AsRef<str>) -> Option<compact_str::CompactString> {
        self.settings.remove(&self.key_prefix(key))
    }

    pub fn read_serde_setting<T: serde::de::DeserializeOwned>(
        &self,
        key: impl AsRef<str>,
    ) -> Result<T, serde_json::Error> {
        let value = match self.settings.get(&self.key_prefix(key)) {
            Some(v) => v,
            None => return serde_json::from_value(serde_json::Value::Null),
        };

        serde_json::from_str(value)
    }

    pub async fn nest<T: 'static>(
        &mut self,
        nested_prefix: &str,
        deserializer: &impl SettingsDeserializeExt,
    ) -> Result<T, anyhow::Error> {
        let settings_deserializer = SettingsDeserializer::new(
            self.database.clone(),
            self.nest_prefix(nested_prefix),
            self.settings,
        );

        let boxed = deserializer
            .deserialize_boxed(settings_deserializer)
            .await?;
        let settings = boxed
            .downcast::<T>()
            .map_err(|_| anyhow::anyhow!("failed to downcast settings"))?;

        Ok(*settings)
    }
}

pub type ExtensionSettings = Box<dyn SettingsSerializeExt + Send + Sync + 'static>;
pub type ExtensionSettingsDeserializer = Arc<dyn SettingsDeserializeExt + Send + Sync + 'static>;

#[async_trait::async_trait]
pub trait SettingsSerializeExt {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error>;
}

#[async_trait::async_trait]
pub trait SettingsDeserializeExt {
    async fn deserialize_boxed(
        &self,
        deserializer: SettingsDeserializer<'_>,
    ) -> Result<Box<dyn std::any::Any + Send>, anyhow::Error>;
}

#[async_trait::async_trait]
impl<T: SettingsSerializeExt + ?Sized + Send + Sync> SettingsSerializeExt for Box<T> {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        (**self).serialize(serializer).await
    }
}

#[async_trait::async_trait]
impl<T: SettingsDeserializeExt + ?Sized + Send + Sync> SettingsDeserializeExt for Arc<T> {
    async fn deserialize_boxed(
        &self,
        deserializer: SettingsDeserializer<'_>,
    ) -> Result<Box<dyn std::any::Any + Send>, anyhow::Error> {
        (**self).deserialize_boxed(deserializer).await
    }
}

pub struct EmptySettings;

#[async_trait::async_trait]
impl SettingsSerializeExt for EmptySettings {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        Ok(serializer)
    }
}

#[async_trait::async_trait]
impl SettingsDeserializeExt for EmptySettings {
    async fn deserialize_boxed(
        &self,
        _deserializer: SettingsDeserializer<'_>,
    ) -> Result<Box<dyn std::any::Any + Send>, anyhow::Error> {
        Ok(Box::new(EmptySettings))
    }
}
