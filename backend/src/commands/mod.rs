use shared::extensions::commands::CliCommandGroupBuilder;

mod diagnostics;
mod extensions;
mod import;
mod service_install;
mod version;

pub fn commands(cli: CliCommandGroupBuilder) -> CliCommandGroupBuilder {
    cli.add_command(
        "version",
        "Prints the current executable version and exits.",
        version::VersionCommand,
    )
    .add_command(
        "service-install",
        "Installs the Panel service on the system.",
        service_install::ServiceInstallCommand,
    )
    .add_command(
        "diagnostics",
        "Gets Diagnostic Data for the Panel.",
        diagnostics::DiagnosticsCommand,
    )
    .add_group(
        "import",
        "Import data from other panel software into Calagopus.",
        import::commands,
    )
    .add_group(
        "extensions",
        "Manage Extensions for the Panel.",
        extensions::commands,
    )
    .add_group(
        "database-migrator",
        "Manage Database Migrations.",
        database_migrator::commands::commands,
    )
}
