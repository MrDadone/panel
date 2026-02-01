use shared::extensions::commands::CliCommandGroupBuilder;

mod migrate;
mod status;
mod version;

pub fn commands(cli: CliCommandGroupBuilder) -> CliCommandGroupBuilder {
    cli.add_command(
        "status",
        "Shows the current status of database migrations.",
        status::StatusCommand,
    )
    .add_command(
        "migrate",
        "Applies pending database migrations.",
        migrate::MigrateCommand,
    )
    .add_command(
        "version",
        "Prints the current executable version and exits.",
        version::VersionCommand,
    )
}
