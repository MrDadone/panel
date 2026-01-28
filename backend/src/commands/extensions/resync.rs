use clap::Args;
use colored::Colorize;

#[derive(Args)]
pub struct ResyncArgs {}

pub struct ResyncCommand;

impl shared::extensions::commands::CliCommand<ResyncArgs> for ResyncCommand {
    fn get_command(&self, command: clap::Command) -> clap::Command {
        command
    }

    fn get_executor(self) -> Box<shared::extensions::commands::ExecutorFunc> {
        Box::new(|_env, _arg_matches| {
            Box::pin(async move {
                if tokio::fs::metadata(".sqlx")
                    .await
                    .ok()
                    .is_none_or(|e| !e.is_dir())
                {
                    eprintln!(
                        "{} {} {}",
                        "failed to find".red(),
                        ".sqlx".bright_red(),
                        "directory, make sure you are in the panel root.".red()
                    );
                    std::process::exit(1);
                }

                if let Err(err) = tokio::task::spawn_blocking(|| {
                    shared::extensions::distr::resync_extension_list()
                })
                .await?
                {
                    eprintln!(
                        "{} {}",
                        "failed to resync internal extension list:".red(),
                        err.to_string().red()
                    );
                    std::process::exit(1);
                }

                println!(
                    "{}",
                    "successfully resynced internal extension list.".green()
                );

                Ok(())
            })
        })
    }
}
