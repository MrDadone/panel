use colored::Colorize;
use shared::extensions::commands::CliCommandGroupBuilder;

#[tokio::main]
async fn main() {
    let env = shared::env::Env::parse();

    let cli = CliCommandGroupBuilder::new(
        "database-migrator",
        "A dedicated tool for applying database migrations for the panel.",
    );
    let mut cli = database_migrator::commands::commands(cli);

    match cli.get_matches().remove_subcommand() {
        Some((command, arg_matches)) => {
            if let Some((func, arg_matches)) = cli.match_command(command, arg_matches) {
                match func(env.as_ref().ok().map(|e| e.0.clone()), arg_matches).await {
                    Ok(()) => {
                        std::process::exit(0);
                    }
                    Err(err) => {
                        eprintln!(
                            "{}: {:?}",
                            "an error occurred while running cli command".red(),
                            err
                        );
                        std::process::exit(1);
                    }
                }
            } else {
                cli.print_help();
                std::process::exit(0);
            }
        }
        None => {
            cli.print_help();
            std::process::exit(0);
        }
    }
}
