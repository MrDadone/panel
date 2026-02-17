use crate::{env::RedisMode, response::ApiResponse};
use axum::http::StatusCode;
use colored::Colorize;
use compact_str::ToCompactString;
use rustis::{
    client::Client,
    commands::{GenericCommands, InfoSection, ServerCommands, SetExpiration, StringCommands},
    resp::BulkString,
};
use serde::{Serialize, de::DeserializeOwned};
use std::{
    future::Future,
    sync::{
        Arc,
        atomic::{AtomicU64, Ordering},
    },
    time::{Duration, Instant},
};

#[derive(Clone, Debug)]
struct InternalEntry {
    data: Arc<Vec<u8>>,
    intended_ttl: Duration,
}

struct DynamicExpiry;

impl moka::Expiry<compact_str::CompactString, InternalEntry> for DynamicExpiry {
    fn expire_after_create(
        &self,
        _key: &compact_str::CompactString,
        value: &InternalEntry,
        _created_at: Instant,
    ) -> Option<Duration> {
        Some(value.intended_ttl)
    }
}

pub struct Cache {
    pub client: Arc<Client>,
    use_internal_cache: bool,
    local: moka::future::Cache<compact_str::CompactString, InternalEntry>,

    cache_calls: AtomicU64,
    cache_latency_ns_total: AtomicU64,
    cache_latency_ns_max: AtomicU64,
    cache_misses: AtomicU64,
}

impl Cache {
    pub async fn new(env: &crate::env::Env) -> Self {
        let start = std::time::Instant::now();

        let client = Arc::new(match &env.redis_mode {
            RedisMode::Redis { redis_url } => Client::connect(redis_url.clone()).await.unwrap(),
            RedisMode::Sentinel {
                cluster_name,
                redis_sentinels,
            } => Client::connect(
                format!(
                    "redis-sentinel://{}/{cluster_name}/0",
                    redis_sentinels.join(",")
                )
                .as_str(),
            )
            .await
            .unwrap(),
        });

        let local_cache = moka::future::Cache::builder()
            .max_capacity(65536)
            .expire_after(DynamicExpiry)
            .build();

        let instance = Self {
            client,
            use_internal_cache: env.app_use_internal_cache,
            local: local_cache,
            cache_calls: AtomicU64::new(0),
            cache_latency_ns_total: AtomicU64::new(0),
            cache_latency_ns_max: AtomicU64::new(0),
            cache_misses: AtomicU64::new(0),
        };

        let version = instance
            .version()
            .await
            .unwrap_or_else(|_| "unknown".into());

        tracing::info!(
            "{} connected {}",
            "cache".bright_yellow(),
            format!(
                "(redis@{}, {}ms, moka_enabled={})",
                version,
                start.elapsed().as_millis(),
                env.app_use_internal_cache
            )
            .bright_black()
        );

        instance
    }

    pub async fn version(&self) -> Result<compact_str::CompactString, rustis::Error> {
        let version: String = self.client.info([InfoSection::Server]).await?;
        let version = version
            .lines()
            .find(|line| line.starts_with("redis_version:"))
            .unwrap_or("redis_version:unknown")
            .split(':')
            .nth(1)
            .unwrap_or("unknown")
            .into();

        Ok(version)
    }

    pub async fn ratelimit(
        &self,
        limit_identifier: impl AsRef<str>,
        limit: u64,
        limit_window: u64,
        client: impl Into<String>,
    ) -> Result<(), ApiResponse> {
        let key = format!(
            "ratelimit::{}::{}",
            limit_identifier.as_ref(),
            client.into()
        );

        let now = chrono::Utc::now().timestamp();
        let expiry = self.client.expiretime(&key).await.unwrap_or_default();
        let expire_unix: u64 = if expiry > now + 2 {
            expiry as u64
        } else {
            now as u64 + limit_window
        };

        let limit_used = self.client.get::<u64>(&key).await.unwrap_or_default() + 1;
        self.client
            .set_with_options(key, limit_used, None, SetExpiration::Exat(expire_unix))
            .await?;

        if limit_used >= limit {
            return Err(ApiResponse::error(format!(
                "you are ratelimited, retry in {}s",
                expiry - now
            ))
            .with_status(StatusCode::TOO_MANY_REQUESTS));
        }

        Ok(())
    }

    #[tracing::instrument(skip(self, fn_compute))]
    pub async fn cached<
        T: Serialize + DeserializeOwned + Send,
        F: FnOnce() -> Fut,
        Fut: Future<Output = Result<T, FutErr>>,
        FutErr: Into<anyhow::Error> + Send + Sync + 'static,
    >(
        &self,
        key: &str,
        ttl: u64,
        fn_compute: F,
    ) -> Result<T, anyhow::Error> {
        let effective_moka_ttl = if self.use_internal_cache {
            Duration::from_secs(ttl)
        } else {
            Duration::from_millis(50)
        };

        let key_owned = key.to_compact_string();
        let client = self.client.clone();

        self.cache_calls.fetch_add(1, Ordering::Relaxed);
        let start_time = Instant::now();

        let entry = self
            .local
            .try_get_with(key_owned.clone(), async move {
                tracing::debug!("checking redis cache");
                let cached_value: Option<BulkString> = client
                    .get(&*key_owned)
                    .await
                    .map_err(|err| {
                        tracing::error!("redis get error: {:?}", err);
                        err
                    })
                    .ok()
                    .flatten();

                if let Some(value) = cached_value {
                    tracing::debug!("found in redis cache");
                    let data = value.to_vec();

                    return Ok(InternalEntry {
                        data: Arc::new(data),
                        intended_ttl: effective_moka_ttl,
                    });
                }

                self.cache_misses.fetch_add(1, Ordering::Relaxed);

                tracing::debug!("executing compute");
                let result = fn_compute().await.map_err(|e| e.into())?;
                tracing::debug!("executed compute");

                let serialized = rmp_serde::to_vec(&result)?;
                let serialized_arc = Arc::new(serialized);

                let _ = client
                    .set_with_options(
                        &*key_owned,
                        serialized_arc.as_slice(),
                        None,
                        SetExpiration::Ex(ttl),
                    )
                    .await;

                Ok::<_, anyhow::Error>(InternalEntry {
                    data: serialized_arc,
                    intended_ttl: effective_moka_ttl,
                })
            })
            .await;

        let elapsed_ns = start_time.elapsed().as_nanos() as u64;
        self.cache_latency_ns_total
            .fetch_add(elapsed_ns, Ordering::Relaxed);

        let _ = self.cache_latency_ns_max.fetch_update(
            Ordering::Relaxed,
            Ordering::Relaxed,
            |current_max| {
                if elapsed_ns > current_max {
                    Some(elapsed_ns)
                } else {
                    Some(current_max)
                }
            },
        );

        match entry {
            Ok(internal_entry) => {
                let val = rmp_serde::from_slice::<T>(&internal_entry.data)?;
                Ok(val)
            }
            Err(arc_error) => Err(anyhow::anyhow!("cache computation failed: {:?}", arc_error)),
        }
    }

    pub async fn invalidate(&self, key: &str) -> Result<(), anyhow::Error> {
        self.local.invalidate(key).await;
        self.client.del(key).await?;

        Ok(())
    }

    #[inline]
    pub fn cache_calls(&self) -> u64 {
        self.cache_calls.load(Ordering::Relaxed)
    }

    #[inline]
    pub fn cache_misses(&self) -> u64 {
        self.cache_misses.load(Ordering::Relaxed)
    }

    #[inline]
    pub fn cache_latency_ns_average(&self) -> u64 {
        let calls = self.cache_calls();
        if calls == 0 {
            0
        } else {
            self.cache_latency_ns_total.load(Ordering::Relaxed) / calls
        }
    }
}
