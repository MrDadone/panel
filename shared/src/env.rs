use anyhow::Context;
use dotenvy::dotenv;
use tracing_subscriber::fmt::writer::MakeWriterExt;

#[derive(Clone)]
pub enum RedisMode {
    Redis { redis_url: String },
    Sentinel { redis_sentinels: Vec<String> },
}

impl std::fmt::Display for RedisMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RedisMode::Redis { .. } => write!(f, "Redis"),
            RedisMode::Sentinel { .. } => write!(f, "Sentinel"),
        }
    }
}

#[derive(Clone)]
pub struct Env {
    pub redis_mode: RedisMode,

    pub sentry_url: Option<String>,
    pub database_migrate: bool,
    pub database_url: String,
    pub database_url_primary: Option<String>,

    pub bind: String,
    pub port: u16,

    pub app_debug: bool,
    pub app_log_directory: String,
    pub app_encryption_key: String,
    pub server_name: Option<String>,
}

impl Env {
    pub fn parse() -> Result<(Env, tracing_appender::non_blocking::WorkerGuard), anyhow::Error> {
        dotenv().ok();

        let env = Self {
            redis_mode: match std::env::var("REDIS_MODE")
                .unwrap_or("redis".to_string())
                .trim_matches('"')
            {
                "redis" => RedisMode::Redis {
                    redis_url: std::env::var("REDIS_URL")
                        .context("REDIS_URL is required")?
                        .trim_matches('"')
                        .to_string(),
                },
                "sentinel" => RedisMode::Sentinel {
                    redis_sentinels: std::env::var("REDIS_SENTINELS")
                        .context("REDIS_SENTINELS is required")?
                        .trim_matches('"')
                        .split(',')
                        .map(|s| s.to_string())
                        .collect(),
                },
                _ => {
                    return Err(anyhow::anyhow!(
                        "Invalid REDIS_MODE. Expected 'redis' or 'sentinel'."
                    ));
                }
            },

            sentry_url: std::env::var("SENTRY_URL")
                .ok()
                .map(|s| s.trim_matches('"').to_string()),
            database_migrate: std::env::var("DATABASE_MIGRATE")
                .unwrap_or("false".to_string())
                .trim_matches('"')
                .parse()
                .unwrap(),
            database_url: std::env::var("DATABASE_URL")
                .context("DATABASE_URL is required")?
                .trim_matches('"')
                .to_string(),
            database_url_primary: std::env::var("DATABASE_URL_PRIMARY")
                .ok()
                .map(|s| s.trim_matches('"').to_string()),

            bind: std::env::var("BIND")
                .unwrap_or("0.0.0.0".to_string())
                .trim_matches('"')
                .to_string(),
            port: std::env::var("PORT")
                .unwrap_or("6969".to_string())
                .parse()
                .context("Invalid PORT value")?,

            app_debug: std::env::var("APP_DEBUG")
                .unwrap_or("false".to_string())
                .trim_matches('"')
                .parse()
                .context("Invalid APP_DEBUG value")?,
            app_log_directory: std::env::var("APP_LOG_DIRECTORY")
                .unwrap_or("logs".to_string())
                .trim_matches('"')
                .to_string(),
            app_encryption_key: std::env::var("APP_ENCRYPTION_KEY")
                .expect("APP_ENCRYPTION_KEY is required")
                .trim_matches('"')
                .to_string(),
            server_name: std::env::var("SERVER_NAME")
                .ok()
                .map(|s| s.trim_matches('"').to_string()),
        };

        if !std::path::Path::new(&env.app_log_directory).exists() {
            std::fs::create_dir_all(&env.app_log_directory)
                .context("failed to create log directory")?;
        }

        let latest_log_path = std::path::Path::new(&env.app_log_directory).join("panel.log");
        let latest_file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&latest_log_path)
            .context("failed to open latest log file")?;

        let rolling_appender = tracing_appender::rolling::Builder::new()
            .filename_prefix("panel")
            .filename_suffix("log")
            .max_log_files(30)
            .rotation(tracing_appender::rolling::Rotation::DAILY)
            .build(&env.app_log_directory)
            .context("failed to create rolling log file appender")?;

        let (file_appender, _guard) = tracing_appender::non_blocking::NonBlockingBuilder::default()
            .buffered_lines_limit(50)
            .finish(latest_file.and(rolling_appender));

        tracing::subscriber::set_global_default(
            tracing_subscriber::fmt()
                .with_timer(tracing_subscriber::fmt::time::ChronoLocal::rfc_3339())
                .with_writer(std::io::stdout.and(file_appender))
                .with_target(false)
                .with_level(true)
                .with_file(true)
                .with_line_number(true)
                .with_max_level(if env.app_debug {
                    tracing::Level::DEBUG
                } else {
                    tracing::Level::INFO
                })
                .finish(),
        )
        .unwrap();

        Ok((env, _guard))
    }
}
