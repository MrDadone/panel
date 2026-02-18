use clap::{Args, FromArgMatches};
use colored::Colorize;
use std::sync::Arc;

#[derive(Args)]
pub struct MigrateArgs {
    #[arg(
        long = "live",
        help = "whether to use the on-disk migrations instead of the embedded migrations",
        default_value = "false"
    )]
    live: bool,
    #[arg(
        long = "force",
        help = "whether to mark all migrations as applied even if they fail to run",
        default_value = "false"
    )]
    force: bool,
    #[arg(
        long = "limit",
        help = "the maximum amount of migrations to apply at this time (0 for unlimited)",
        default_value = "0"
    )]
    limit: usize,

    #[arg(
        long = "unsafe-apply-all",
        help = "whether to apply all migrations without checking if they were applied before (DANGEROUS)",
        default_value = "false"
    )]
    unsafe_apply_all: bool,
    #[arg(
        long = "unsafe-skip-run",
        help = "whether to mark all migrations as applied without actually running them (DANGEROUS)",
        default_value = "false"
    )]
    unsafe_skip_run: bool,
}

pub struct MigrateCommand;

impl shared::extensions::commands::CliCommand<MigrateArgs> for MigrateCommand {
    fn get_command(&self, command: clap::Command) -> clap::Command {
        command
    }

    fn get_executor(self) -> Box<shared::extensions::commands::ExecutorFunc> {
        Box::new(|env, arg_matches| {
            Box::pin(async move {
                let args = MigrateArgs::from_arg_matches(&arg_matches)?;

                let env = match env {
                    Some(env) => env,
                    None => {
                        eprintln!(
                            "{}",
                            "please setup the panel environment before using this tool.".red()
                        );

                        return Ok(1);
                    }
                };

                let cache = Arc::new(shared::cache::Cache::new(&env).await);
                let database = Arc::new(shared::database::Database::new(&env, cache.clone()).await);

                crate::ensure_migrations_table(database.write()).await?;

                tracing::info!("fetching applied migrations...");
                let applied_migrations = crate::fetch_applied_migrations(database.write()).await?;

                let migrations = if args.live {
                    let live_path = match () {
                        _ if tokio::fs::metadata("migrations").await.is_ok() => "migrations",
                        _ if tokio::fs::metadata("database/migrations").await.is_ok() => {
                            "database/migrations"
                        }
                        _ if tokio::fs::metadata("../database/migrations").await.is_ok() => {
                            "../database/migrations"
                        }
                        _ => {
                            tracing::error!(
                                "failed to find live migrations folder, expected one of: ./migrations, ./database/migrations, ../database/migrations"
                            );
                            return Ok(1);
                        }
                    };

                    tracing::info!("collecting migrations from filesystem...");
                    crate::collect_migrations(live_path).await?
                } else {
                    tracing::info!("collecting embedded migrations...");
                    crate::collect_embedded_migrations()?
                };

                tracing::info!("found {} migrations.", migrations.len());

                let mut ran_migrations = 0;
                for migration in migrations
                    .into_iter()
                    .filter(|m| {
                        args.unsafe_apply_all
                            || !applied_migrations.iter().any(|am| am.id == m.snapshot.id)
                    })
                    .take(if args.limit == 0 {
                        usize::MAX
                    } else {
                        args.limit
                    })
                {
                    tracing::info!(
                        tables = ?migration.snapshot.tables().len(),
                        enums = ?migration.snapshot.enums().len(),
                        columns = ?migration.snapshot.columns(None).len(),
                        indexes = ?migration.snapshot.indexes(None).len(),
                        foreign_keys = ?migration.snapshot.foreign_keys(None).len(),
                        primary_keys = ?migration.snapshot.primary_keys(None).len(),
                        name = %migration.name,
                        "applying migration"
                    );

                    if args.unsafe_skip_run {
                        tracing::warn!(
                            name = %migration.name,
                            "marking migration as applied without running due to --unsafe-skip-run"
                        );
                        crate::mark_migration_as_applied(database.write(), &migration).await?;
                    } else if let Err(err) =
                        crate::run_migration(database.write(), &migration).await
                    {
                        if args.force {
                            tracing::error!(
                                name = %migration.name,
                                "failed to apply migration, marking as applied due to --force: {}",
                                err
                            );
                            crate::mark_migration_as_applied(database.write(), &migration).await?;
                        } else {
                            eprintln!("{}: {}", "failed to apply migration".red(), err);
                            return Ok(1);
                        }
                    }

                    tracing::info!(name = %migration.name, "successfully applied migration");
                    tracing::info!("");

                    ran_migrations += 1;
                }

                tracing::info!("applied {} new migrations.", ran_migrations);

                Ok(0)
            })
        })
    }
}
