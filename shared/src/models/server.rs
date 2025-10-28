use super::{BaseModel, ByUuid, Fetchable};
use crate::{State, storage::StorageUrlRetriever};
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};
use sqlx::{Row, postgres::PgRow, prelude::Type};
use std::{
    collections::{BTreeMap, HashMap},
    sync::Arc,
};
use utoipa::ToSchema;
use validator::Validate;

pub type GetServer = crate::extract::ConsumingExtension<Server>;
pub type GetServerActivityLogger = crate::extract::ConsumingExtension<ServerActivityLogger>;

#[derive(Clone)]
pub struct ServerActivityLogger {
    pub state: State,
    pub server_uuid: uuid::Uuid,
    pub user_uuid: uuid::Uuid,
    pub api_key_uuid: Option<uuid::Uuid>,
    pub ip: std::net::IpAddr,
}

impl ServerActivityLogger {
    pub async fn log(&self, event: &str, data: serde_json::Value) {
        if let Err(err) = crate::models::server_activity::ServerActivity::log(
            &self.state.database,
            self.server_uuid,
            Some(self.user_uuid),
            self.api_key_uuid,
            event,
            Some(self.ip.into()),
            data,
        )
        .await
        {
            tracing::warn!(
                user = %self.user_uuid,
                "failed to log server activity: {:#?}",
                err
            );
        }
    }
}

#[derive(ToSchema, Serialize, Deserialize, Type, PartialEq, Eq, Hash, Clone, Copy)]
#[serde(rename_all = "snake_case")]
#[schema(rename_all = "snake_case")]
#[sqlx(type_name = "server_status", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ServerStatus {
    Installing,
    InstallFailed,
    ReinstallFailed,
    RestoringBackup,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Server {
    pub uuid: uuid::Uuid,
    pub uuid_short: i32,
    pub external_id: Option<String>,
    pub allocation: Option<super::server_allocation::ServerAllocation>,
    pub destination_allocation_uuid: Option<uuid::Uuid>,
    pub node: Fetchable<super::node::Node>,
    pub destination_node: Option<Fetchable<super::node::Node>>,
    pub owner: super::user::User,
    pub egg: Box<super::nest_egg::NestEgg>,
    pub nest: Box<super::nest::Nest>,
    pub backup_configuration: Option<Fetchable<super::backup_configurations::BackupConfiguration>>,

    pub status: Option<ServerStatus>,
    pub suspended: bool,

    pub name: String,
    pub description: Option<String>,

    pub memory: i64,
    pub swap: i64,
    pub disk: i64,
    pub io_weight: Option<i16>,
    pub cpu: i32,
    pub pinned_cpus: Vec<i16>,

    pub startup: String,
    pub image: String,
    pub auto_kill: wings_api::ServerConfigurationAutoKill,
    pub timezone: Option<String>,

    pub allocation_limit: i32,
    pub database_limit: i32,
    pub backup_limit: i32,
    pub schedule_limit: i32,

    pub subuser_permissions: Option<Arc<Vec<String>>>,
    pub subuser_ignored_files: Option<Vec<String>>,
    #[serde(skip_serializing, skip_deserializing)]
    subuser_ignored_files_overrides: Option<Box<ignore::overrides::Override>>,

    pub created: chrono::NaiveDateTime,
}

impl BaseModel for Server {
    const NAME: &'static str = "server";

    #[inline]
    fn columns(prefix: Option<&str>) -> BTreeMap<&'static str, String> {
        let prefix = prefix.unwrap_or_default();

        let mut columns = BTreeMap::from([
            ("servers.uuid", format!("{prefix}uuid")),
            ("servers.uuid_short", format!("{prefix}uuid_short")),
            ("servers.external_id", format!("{prefix}external_id")),
            (
                "servers.destination_allocation_uuid",
                format!("{prefix}destination_allocation_uuid"),
            ),
            ("servers.node_uuid", format!("{prefix}node_uuid")),
            (
                "servers.destination_node_uuid",
                format!("{prefix}destination_node_uuid"),
            ),
            (
                "servers.backup_configuration_uuid",
                format!("{prefix}backup_configuration_uuid"),
            ),
            ("servers.status", format!("{prefix}status")),
            ("servers.suspended", format!("{prefix}suspended")),
            ("servers.name", format!("{prefix}name")),
            ("servers.description", format!("{prefix}description")),
            ("servers.memory", format!("{prefix}memory")),
            ("servers.swap", format!("{prefix}swap")),
            ("servers.disk", format!("{prefix}disk")),
            ("servers.io_weight", format!("{prefix}io_weight")),
            ("servers.cpu", format!("{prefix}cpu")),
            ("servers.pinned_cpus", format!("{prefix}pinned_cpus")),
            ("servers.startup", format!("{prefix}startup")),
            ("servers.image", format!("{prefix}image")),
            ("servers.auto_kill", format!("{prefix}auto_kill")),
            ("servers.timezone", format!("{prefix}timezone")),
            (
                "servers.allocation_limit",
                format!("{prefix}allocation_limit"),
            ),
            ("servers.database_limit", format!("{prefix}database_limit")),
            ("servers.backup_limit", format!("{prefix}backup_limit")),
            ("servers.schedule_limit", format!("{prefix}schedule_limit")),
            ("servers.created", format!("{prefix}created")),
        ]);

        columns.extend(super::server_allocation::ServerAllocation::columns(Some(
            "allocation_",
        )));
        columns.extend(super::user::User::columns(Some("owner_")));
        columns.extend(super::nest_egg::NestEgg::columns(Some("egg_")));
        columns.extend(super::nest::Nest::columns(Some("nest_")));

        columns
    }

    #[inline]
    fn map(prefix: Option<&str>, row: &PgRow) -> Self {
        let prefix = prefix.unwrap_or_default();

        Self {
            uuid: row.get(format!("{prefix}uuid").as_str()),
            uuid_short: row.get(format!("{prefix}uuid_short").as_str()),
            external_id: row.get(format!("{prefix}external_id").as_str()),
            allocation: if row
                .try_get::<uuid::Uuid, _>(format!("{prefix}allocation_uuid").as_str())
                .is_ok()
            {
                Some(super::server_allocation::ServerAllocation::map(
                    Some("allocation_"),
                    row,
                ))
            } else {
                None
            },
            destination_allocation_uuid: row
                .try_get::<uuid::Uuid, _>(format!("{prefix}destination_allocation_uuid").as_str())
                .ok(),
            node: super::node::Node::get_fetchable(row.get(format!("{prefix}node_uuid").as_str())),
            destination_node: super::node::Node::get_fetchable_from_row(
                row,
                format!("{prefix}destination_node_uuid"),
            ),
            owner: super::user::User::map(Some("owner_"), row),
            egg: Box::new(super::nest_egg::NestEgg::map(Some("egg_"), row)),
            nest: Box::new(super::nest::Nest::map(Some("nest_"), row)),
            backup_configuration:
                super::backup_configurations::BackupConfiguration::get_fetchable_from_row(
                    row,
                    format!("{prefix}backup_configuration_uuid"),
                ),
            status: row.get(format!("{prefix}status").as_str()),
            suspended: row.get(format!("{prefix}suspended").as_str()),
            name: row.get(format!("{prefix}name").as_str()),
            description: row.get(format!("{prefix}description").as_str()),
            memory: row.get(format!("{prefix}memory").as_str()),
            swap: row.get(format!("{prefix}swap").as_str()),
            disk: row.get(format!("{prefix}disk").as_str()),
            io_weight: row.get(format!("{prefix}io_weight").as_str()),
            cpu: row.get(format!("{prefix}cpu").as_str()),
            pinned_cpus: row.get(format!("{prefix}pinned_cpus").as_str()),
            startup: row.get(format!("{prefix}startup").as_str()),
            image: row.get(format!("{prefix}image").as_str()),
            auto_kill: serde_json::from_value(
                row.get::<serde_json::Value, _>(format!("{prefix}auto_kill").as_str()),
            )
            .unwrap(),
            timezone: row.get(format!("{prefix}timezone").as_str()),
            allocation_limit: row.get(format!("{prefix}allocation_limit").as_str()),
            database_limit: row.get(format!("{prefix}database_limit").as_str()),
            backup_limit: row.get(format!("{prefix}backup_limit").as_str()),
            schedule_limit: row.get(format!("{prefix}schedule_limit").as_str()),
            subuser_permissions: row
                .try_get::<Vec<String>, _>("permissions")
                .map(Arc::new)
                .ok(),
            subuser_ignored_files: row.try_get::<Vec<String>, _>("ignored_files").ok(),
            subuser_ignored_files_overrides: None,
            created: row.get(format!("{prefix}created").as_str()),
        }
    }
}

impl Server {
    #[allow(clippy::too_many_arguments)]
    pub async fn create(
        database: &crate::database::Database,
        node: &super::node::Node,
        owner_uuid: uuid::Uuid,
        egg_uuid: uuid::Uuid,
        backup_configuration_uuid: Option<uuid::Uuid>,
        allocation_uuid: Option<uuid::Uuid>,
        allocation_uuids: &[uuid::Uuid],
        external_id: Option<&str>,
        start_on_completion: bool,
        skip_installer: bool,
        name: &str,
        description: Option<&str>,
        limits: &ApiServerLimits,
        pinned_cpus: &[i16],
        startup: &str,
        image: &str,
        timezone: Option<&str>,
        feature_limits: &ApiServerFeatureLimits,
    ) -> Result<uuid::Uuid, sqlx::Error> {
        let mut transaction = database.write().begin().await?;
        let mut attempts = 0;

        loop {
            let uuid = uuid::Uuid::new_v4();
            let uuid_short = uuid.as_fields().0 as i32;

            match sqlx::query(
                r#"
                INSERT INTO servers (
                    uuid,
                    uuid_short,
                    external_id,
                    node_uuid,
                    owner_uuid,
                    egg_uuid,
                    backup_configuration_uuid,
                    name,
                    description,
                    status,
                    memory,
                    swap,
                    disk,
                    io_weight,
                    cpu,
                    pinned_cpus,
                    startup,
                    image,
                    timezone,
                    allocation_limit,
                    database_limit,
                    backup_limit,
                    schedule_limit
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9,
                    $10, $11, $12, $13, $14, $15, $16,
                    $17, $18, $19, $20, $21, $22, $23
                )
                RETURNING uuid
                "#,
            )
            .bind(uuid)
            .bind(uuid_short)
            .bind(external_id)
            .bind(node.uuid)
            .bind(owner_uuid)
            .bind(egg_uuid)
            .bind(backup_configuration_uuid)
            .bind(name)
            .bind(description)
            .bind(if skip_installer {
                None
            } else {
                Some(ServerStatus::Installing)
            })
            .bind(limits.memory)
            .bind(limits.swap)
            .bind(limits.disk)
            .bind(limits.io_weight)
            .bind(limits.cpu)
            .bind(pinned_cpus)
            .bind(startup)
            .bind(image)
            .bind(timezone)
            .bind(feature_limits.allocations)
            .bind(feature_limits.databases)
            .bind(feature_limits.backups)
            .bind(feature_limits.schedules)
            .fetch_one(&mut *transaction)
            .await
            {
                Ok(row) => {
                    let uuid: uuid::Uuid = row.get("uuid");

                    let allocation_uuid: Option<uuid::Uuid> =
                        if let Some(allocation_uuid) = allocation_uuid {
                            let row = sqlx::query(
                                r#"
                                INSERT INTO server_allocations (server_uuid, allocation_uuid)
                                VALUES ($1, $2)
                                RETURNING uuid
                                "#,
                            )
                            .bind(uuid)
                            .bind(allocation_uuid)
                            .fetch_one(&mut *transaction)
                            .await?;

                            Some(row.get("uuid"))
                        } else {
                            None
                        };

                    for allocation_uuid in allocation_uuids {
                        sqlx::query(
                            r#"
                            INSERT INTO server_allocations (server_uuid, allocation_uuid)
                            VALUES ($1, $2)
                            "#,
                        )
                        .bind(uuid)
                        .bind(allocation_uuid)
                        .execute(&mut *transaction)
                        .await?;
                    }

                    sqlx::query(
                        r#"
                        UPDATE servers
                        SET allocation_uuid = $1
                        WHERE servers.uuid = $2
                        "#,
                    )
                    .bind(allocation_uuid)
                    .bind(uuid)
                    .execute(&mut *transaction)
                    .await?;

                    transaction.commit().await?;

                    if let Err(err) = node
                        .api_client(database)
                        .post_servers(&wings_api::servers::post::RequestBody {
                            uuid,
                            start_on_completion,
                            skip_scripts: skip_installer,
                        })
                        .await
                    {
                        tracing::error!(server = %uuid, node = %node.uuid, "failed to create server: {:#?}", err);

                        sqlx::query!("DELETE FROM servers WHERE servers.uuid = $1", uuid)
                            .execute(database.write())
                            .await?;

                        return Err(sqlx::Error::Io(std::io::Error::other(err.1.error)));
                    }

                    return Ok(uuid);
                }
                Err(err) => {
                    if attempts >= 8 {
                        tracing::error!(
                            "failed to create server after 8 attempts, giving up: {:#?}",
                            err
                        );
                        transaction.rollback().await?;

                        return Err(err);
                    }
                    attempts += 1;

                    tracing::warn!(
                        "failed to create server, retrying with new uuid: {:#?}",
                        err
                    );

                    continue;
                }
            }
        }
    }

    pub async fn by_node_uuid_uuid(
        database: &crate::database::Database,
        node_uuid: uuid::Uuid,
        uuid: uuid::Uuid,
    ) -> Result<Option<Self>, sqlx::Error> {
        let row = sqlx::query(&format!(
            r#"
            SELECT {}
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            WHERE (servers.node_uuid = $1 OR servers.destination_node_uuid = $1) AND servers.uuid = $2
            "#,
            Self::columns_sql(None)
        ))
        .bind(node_uuid)
        .bind(uuid)
        .fetch_optional(database.read())
        .await?;

        Ok(row.map(|row| Self::map(None, &row)))
    }

    pub async fn by_external_id(
        database: &crate::database::Database,
        external_id: &str,
    ) -> Result<Option<Self>, sqlx::Error> {
        let row = sqlx::query(&format!(
            r#"
            SELECT {}
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            WHERE servers.external_id = $1
            "#,
            Self::columns_sql(None)
        ))
        .bind(external_id)
        .fetch_optional(database.read())
        .await?;

        Ok(row.map(|row| Self::map(None, &row)))
    }

    pub async fn by_identifier(
        database: &crate::database::Database,
        identifier: &str,
    ) -> Result<Option<Self>, anyhow::Error> {
        let query = format!(
            r#"
            SELECT {}
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            WHERE servers.{} = $1
            "#,
            Self::columns_sql(None),
            match identifier.len() {
                8 => "uuid_short",
                36 => "uuid",
                _ => return Ok(None),
            }
        );

        let mut row = sqlx::query(&query);
        row = match identifier.len() {
            8 => row.bind(u32::from_str_radix(identifier, 16)? as i32),
            36 => row.bind(uuid::Uuid::parse_str(identifier)?),
            _ => return Ok(None),
        };
        let row = row.fetch_optional(database.read()).await?;

        Ok(row.map(|row| Self::map(None, &row)))
    }

    pub async fn by_user_identifier_cached(
        database: &crate::database::Database,
        user: &super::user::User,
        identifier: &str,
    ) -> Result<Option<Self>, anyhow::Error> {
        database
            .cache
            .cached(&format!("user::{}::server::{identifier}", user.uuid), 5, || async {
                let query = format!(
                    r#"
                    SELECT {}, server_subusers.permissions, server_subusers.ignored_files
                    FROM servers
                    LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
                    LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
                    JOIN users ON users.uuid = servers.owner_uuid
                    LEFT JOIN roles ON roles.uuid = users.role_uuid
                    JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
                    LEFT JOIN server_subusers ON server_subusers.server_uuid = servers.uuid AND server_subusers.user_uuid = $1
                    JOIN nests ON nests.uuid = nest_eggs.nest_uuid
                    WHERE servers.{} = $3 AND (servers.owner_uuid = $1 OR server_subusers.user_uuid = $1 OR $2)
                    "#,
                    Self::columns_sql(None),
                    match identifier.len() {
                        8 => "uuid_short",
                        36 => "uuid",
                        _ => return Ok::<_, anyhow::Error>(None),
                    }
                );

                let mut row = sqlx::query(&query).bind(user.uuid).bind(user.admin);
                row = match identifier.len() {
                    8 => row.bind(u32::from_str_radix(identifier, 16)? as i32),
                    36 => row.bind(uuid::Uuid::parse_str(identifier)?),
                    _ => return Ok(None),
                };
                let row = row.fetch_optional(database.read()).await?;

                Ok(row.map(|row| Self::map(None, &row)))
            })
            .await
    }

    pub async fn by_owner_uuid_with_pagination(
        database: &crate::database::Database,
        owner_uuid: uuid::Uuid,
        page: i64,
        per_page: i64,
        search: Option<&str>,
    ) -> Result<super::Pagination<Self>, sqlx::Error> {
        let offset = (page - 1) * per_page;

        let rows = sqlx::query(&format!(
            r#"
            SELECT {}, COUNT(*) OVER() AS total_count
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            WHERE servers.owner_uuid = $1 AND ($2 IS NULL OR servers.name ILIKE '%' || $2 || '%')
            ORDER BY servers.created
            LIMIT $3 OFFSET $4
            "#,
            Self::columns_sql(None)
        ))
        .bind(owner_uuid)
        .bind(search)
        .bind(per_page)
        .bind(offset)
        .fetch_all(database.read())
        .await?;

        Ok(super::Pagination {
            total: rows.first().map_or(0, |row| row.get("total_count")),
            per_page,
            page,
            data: rows.into_iter().map(|row| Self::map(None, &row)).collect(),
        })
    }

    pub async fn by_user_uuid_with_pagination(
        database: &crate::database::Database,
        user_uuid: uuid::Uuid,
        page: i64,
        per_page: i64,
        search: Option<&str>,
    ) -> Result<super::Pagination<Self>, sqlx::Error> {
        let offset = (page - 1) * per_page;

        let rows = sqlx::query(&format!(
            r#"
            SELECT DISTINCT ON (servers.uuid, servers.created) {}, server_subusers.permissions, server_subusers.ignored_files, COUNT(*) OVER() AS total_count
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            LEFT JOIN server_subusers ON server_subusers.server_uuid = servers.uuid AND server_subusers.user_uuid = $1
            WHERE
                (servers.owner_uuid = $1 OR server_subusers.user_uuid = $1)
                AND ($2 IS NULL OR servers.name ILIKE '%' || $2 || '%' OR users.username ILIKE '%' || $2 || '%' OR users.email ILIKE '%' || $2 || '%')
            ORDER BY servers.created
            LIMIT $3 OFFSET $4
            "#,
            Self::columns_sql(None)
        ))
        .bind(user_uuid)
        .bind(search)
        .bind(per_page)
        .bind(offset)
        .fetch_all(database.read())
        .await?;

        Ok(super::Pagination {
            total: rows.first().map_or(0, |row| row.get("total_count")),
            per_page,
            page,
            data: rows.into_iter().map(|row| Self::map(None, &row)).collect(),
        })
    }

    pub async fn by_not_user_uuid_with_pagination(
        database: &crate::database::Database,
        user_uuid: uuid::Uuid,
        page: i64,
        per_page: i64,
        search: Option<&str>,
    ) -> Result<super::Pagination<Self>, sqlx::Error> {
        let offset = (page - 1) * per_page;

        let rows = sqlx::query(&format!(
            r#"
            SELECT DISTINCT ON (servers.uuid, servers.created) {}, server_subusers.permissions, server_subusers.ignored_files, COUNT(*) OVER() AS total_count
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            LEFT JOIN server_subusers ON server_subusers.server_uuid = servers.uuid AND server_subusers.user_uuid = $1
            WHERE
                servers.owner_uuid != $1 AND (server_subusers.user_uuid IS NULL OR server_subusers.user_uuid != $1)
                AND ($2 IS NULL OR servers.name ILIKE '%' || $2 || '%' OR users.username ILIKE '%' || $2 || '%' OR users.email ILIKE '%' || $2 || '%')
            ORDER BY servers.created
            LIMIT $3 OFFSET $4
            "#,
            Self::columns_sql(None)
        ))
        .bind(user_uuid)
        .bind(search)
        .bind(per_page)
        .bind(offset)
        .fetch_all(database.read())
        .await?;

        Ok(super::Pagination {
            total: rows.first().map_or(0, |row| row.get("total_count")),
            per_page,
            page,
            data: rows.into_iter().map(|row| Self::map(None, &row)).collect(),
        })
    }

    pub async fn by_node_uuid_with_pagination(
        database: &crate::database::Database,
        node_uuid: uuid::Uuid,
        page: i64,
        per_page: i64,
        search: Option<&str>,
    ) -> Result<super::Pagination<Self>, sqlx::Error> {
        let offset = (page - 1) * per_page;

        let rows = sqlx::query(&format!(
            r#"
            SELECT {}, COUNT(*) OVER() AS total_count
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            WHERE servers.node_uuid = $1 AND ($2 IS NULL OR servers.name ILIKE '%' || $2 || '%')
            ORDER BY servers.created
            LIMIT $3 OFFSET $4
            "#,
            Self::columns_sql(None)
        ))
        .bind(node_uuid)
        .bind(search)
        .bind(per_page)
        .bind(offset)
        .fetch_all(database.read())
        .await?;

        Ok(super::Pagination {
            total: rows.first().map_or(0, |row| row.get("total_count")),
            per_page,
            page,
            data: rows.into_iter().map(|row| Self::map(None, &row)).collect(),
        })
    }

    pub async fn by_backup_configuration_uuid_with_pagination(
        database: &crate::database::Database,
        backup_configuration_uuid: uuid::Uuid,
        page: i64,
        per_page: i64,
        search: Option<&str>,
    ) -> Result<super::Pagination<Self>, sqlx::Error> {
        let offset = (page - 1) * per_page;

        let rows = sqlx::query(&format!(
            r#"
            SELECT {}, COUNT(*) OVER() AS total_count
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            WHERE servers.backup_configuration_uuid = $1 AND ($2 IS NULL OR servers.name ILIKE '%' || $2 || '%')
            ORDER BY servers.created
            LIMIT $3 OFFSET $4
            "#,
            Self::columns_sql(None)
        ))
        .bind(backup_configuration_uuid)
        .bind(search)
        .bind(per_page)
        .bind(offset)
        .fetch_all(database.read())
        .await?;

        Ok(super::Pagination {
            total: rows.first().map_or(0, |row| row.get("total_count")),
            per_page,
            page,
            data: rows.into_iter().map(|row| Self::map(None, &row)).collect(),
        })
    }

    pub async fn all_with_pagination(
        database: &crate::database::Database,
        page: i64,
        per_page: i64,
        search: Option<&str>,
    ) -> Result<super::Pagination<Self>, sqlx::Error> {
        let offset = (page - 1) * per_page;

        let rows = sqlx::query(&format!(
            r#"
            SELECT {}, COUNT(*) OVER() AS total_count
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            WHERE $1 IS NULL OR servers.name ILIKE '%' || $1 || '%'
            ORDER BY servers.created
            LIMIT $2 OFFSET $3
            "#,
            Self::columns_sql(None)
        ))
        .bind(search)
        .bind(per_page)
        .bind(offset)
        .fetch_all(database.read())
        .await?;

        Ok(super::Pagination {
            total: rows.first().map_or(0, |row| row.get("total_count")),
            per_page,
            page,
            data: rows.into_iter().map(|row| Self::map(None, &row)).collect(),
        })
    }

    pub async fn count_by_user_uuid(
        database: &crate::database::Database,
        user_uuid: uuid::Uuid,
    ) -> i64 {
        sqlx::query_scalar(
            r#"
            SELECT COUNT(*)
            FROM servers
            WHERE servers.owner_uuid = $1
            "#,
        )
        .bind(user_uuid)
        .fetch_one(database.read())
        .await
        .unwrap_or(0)
    }

    pub async fn count_by_node_uuid(
        database: &crate::database::Database,
        node_uuid: uuid::Uuid,
    ) -> i64 {
        sqlx::query_scalar(
            r#"
            SELECT COUNT(*)
            FROM servers
            WHERE servers.node_uuid = $1
            "#,
        )
        .bind(node_uuid)
        .fetch_one(database.read())
        .await
        .unwrap_or(0)
    }

    pub async fn count_by_nest_egg_uuid(
        database: &crate::database::Database,
        nest_egg_uuid: uuid::Uuid,
    ) -> i64 {
        sqlx::query_scalar(
            r#"
            SELECT COUNT(*)
            FROM servers
            WHERE servers.nest_egg_uuid = $1
            "#,
        )
        .bind(nest_egg_uuid)
        .fetch_one(database.read())
        .await
        .unwrap_or(0)
    }

    pub async fn sync(self, database: &crate::database::Database) -> Result<(), anyhow::Error> {
        match self
            .node
            .fetch_cached(database)
            .await?
            .api_client(database)
            .post_servers_server_sync(
                self.uuid,
                &wings_api::servers_server_sync::post::RequestBody {
                    server: serde_json::to_value(self.into_remote_api_object(database).await?)?,
                },
            )
            .await
        {
            Ok(_) => {}
            Err((_, err)) => return Err(anyhow::anyhow!(err.error)),
        }

        Ok(())
    }

    pub async fn delete(
        &self,
        database: &crate::database::Database,
        force: bool,
    ) -> Result<(), anyhow::Error> {
        let node = self.node.fetch_cached(database).await?;
        let databases =
            super::server_database::ServerDatabase::all_by_server_uuid(database, self.uuid).await?;

        for db in databases {
            match db.delete(database).await {
                Ok(_) => {}
                Err(err) => {
                    tracing::error!(server = %self.uuid, "failed to delete database: {:#?}", err);

                    if !force {
                        return Err(err.into());
                    }
                }
            }
        }

        let mut transaction = database.write().begin().await?;

        sqlx::query!("DELETE FROM servers WHERE servers.uuid = $1", self.uuid)
            .execute(&mut *transaction)
            .await?;

        match node
            .api_client(database)
            .delete_servers_server(self.uuid)
            .await
        {
            Ok(_) => {
                transaction.commit().await?;
                Ok(())
            }
            Err((status, err)) => {
                tracing::error!(server = %self.uuid, node = %self.node.uuid, "failed to delete server: {:#?}", err);

                if force {
                    transaction.commit().await?;
                    Ok(())
                } else {
                    transaction.rollback().await?;
                    Err(anyhow::anyhow!("status code {status}: {}", err.error))
                }
            }
        }
    }

    pub fn wings_permissions(&self, user: &super::user::User) -> Vec<&str> {
        let mut permissions = Vec::new();
        if user.admin {
            permissions.reserve_exact(5);
            permissions.push("websocket.connect");

            permissions.push("*");
            permissions.push("admin.websocket.errors");
            permissions.push("admin.websocket.install");
            permissions.push("admin.websocket.transfer");

            return permissions;
        }

        if let Some(subuser_permissions) = &self.subuser_permissions {
            permissions.reserve_exact(subuser_permissions.len() + 1);
            permissions.push("websocket.connect");

            for permission in subuser_permissions.iter() {
                permissions.push(permission.as_str());
            }
        } else {
            permissions.reserve_exact(2);
            permissions.push("websocket.connect");

            permissions.push("*");
        }

        permissions
    }

    pub async fn backup_configuration(
        &self,
        database: &crate::database::Database,
    ) -> Option<super::backup_configurations::BackupConfiguration> {
        if let Some(backup_configuration) = &self.backup_configuration
            && let Ok(backup_configuration) = backup_configuration.fetch_cached(database).await
        {
            return Some(backup_configuration);
        }

        let node = self.node.fetch_cached(database).await.ok()?;

        if let Some(backup_configuration) = node.backup_configuration
            && let Ok(backup_configuration) = backup_configuration.fetch_cached(database).await
        {
            return Some(backup_configuration);
        }

        if let Some(backup_configuration) = node.location.backup_configuration
            && let Ok(backup_configuration) = backup_configuration.fetch_cached(database).await
        {
            return Some(backup_configuration);
        }

        None
    }

    pub fn is_ignored(&mut self, path: &str, is_dir: bool) -> bool {
        if let Some(ignored_files) = &self.subuser_ignored_files {
            if let Some(overrides) = &self.subuser_ignored_files_overrides {
                return overrides.matched(path, is_dir).is_whitelist();
            }

            let mut override_builder = ignore::overrides::OverrideBuilder::new("/");

            for file in ignored_files {
                override_builder.add(file).ok();
            }

            if let Ok(override_builder) = override_builder.build() {
                let ignored = override_builder.matched(path, is_dir).is_whitelist();
                self.subuser_ignored_files_overrides = Some(Box::new(override_builder));

                return ignored;
            }
        }

        false
    }

    #[inline]
    pub async fn into_remote_api_object(
        self,
        database: &crate::database::Database,
    ) -> Result<RemoteApiServer, anyhow::Error> {
        let (variables, backups, schedules, mounts, allocations) = tokio::try_join!(
            sqlx::query!(
                "SELECT nest_egg_variables.env_variable, COALESCE(server_variables.value, nest_egg_variables.default_value) AS value
                FROM nest_egg_variables
                LEFT JOIN server_variables ON server_variables.variable_uuid = nest_egg_variables.uuid AND server_variables.server_uuid = $1
                WHERE nest_egg_variables.egg_uuid = $2",
                self.uuid,
                self.egg.uuid
            )
            .fetch_all(database.read()),
            sqlx::query!(
                "SELECT server_backups.uuid
                FROM server_backups
                WHERE server_backups.server_uuid = $1",
                self.uuid
            )
            .fetch_all(database.read()),
            sqlx::query!(
                "SELECT server_schedules.uuid, server_schedules.triggers, server_schedules.condition
                FROM server_schedules
                WHERE server_schedules.server_uuid = $1 AND server_schedules.enabled",
                self.uuid
            )
            .fetch_all(database.read()),
            sqlx::query!(
                "SELECT mounts.source, mounts.target, mounts.read_only
                FROM server_mounts
                JOIN mounts ON mounts.uuid = server_mounts.mount_uuid
                WHERE server_mounts.server_uuid = $1",
                self.uuid
            )
            .fetch_all(database.read()),
            sqlx::query!(
                "SELECT node_allocations.ip, node_allocations.port
                FROM server_allocations
                JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
                WHERE server_allocations.server_uuid = $1",
                self.uuid
            )
            .fetch_all(database.read()),
        )?;

        let mut futures = Vec::new();
        futures.reserve_exact(schedules.len());

        for schedule in &schedules {
            futures.push(
                sqlx::query!(
                    "SELECT server_schedule_steps.uuid, server_schedule_steps.schedule_uuid, server_schedule_steps.action
                    FROM server_schedule_steps
                    WHERE server_schedule_steps.schedule_uuid = $1
                    ORDER BY server_schedule_steps.order_, server_schedule_steps.created",
                    schedule.uuid
                )
                .fetch_all(database.read()),
            );
        }

        let results = futures_util::future::try_join_all(futures).await?;
        let mut schedule_steps = HashMap::new();
        schedule_steps.reserve(schedules.len());

        for (i, steps) in results.into_iter().enumerate() {
            schedule_steps.insert(schedules[i].uuid, steps);
        }

        Ok(RemoteApiServer {
            settings: wings_api::ServerConfiguration {
                uuid: self.uuid,
                start_on_completion: None,
                meta: wings_api::ServerConfigurationMeta {
                    name: self.name,
                    description: self.description.unwrap_or_default(),
                },
                suspended: self.suspended,
                invocation: self.startup,
                skip_egg_scripts: false,
                environment: variables
                    .into_iter()
                    .map(|v| {
                        (
                            v.env_variable,
                            serde_json::Value::String(v.value.unwrap_or_default()),
                        )
                    })
                    .collect(),
                labels: IndexMap::new(),
                backups: backups.into_iter().map(|b| b.uuid).collect(),
                schedules: schedules
                    .into_iter()
                    .map(|s| wings_api::Schedule {
                        uuid: s.uuid,
                        triggers: s.triggers,
                        condition: s.condition,
                        actions: schedule_steps
                            .remove(&s.uuid)
                            .unwrap_or_default()
                            .into_iter()
                            .map(|step| {
                                serde_json::to_value(wings_api::ScheduleAction {
                                    uuid: step.uuid,
                                    inner: serde_json::from_value(step.action).unwrap(),
                                })
                                .unwrap()
                            })
                            .collect(),
                    })
                    .collect(),
                allocations: wings_api::ServerConfigurationAllocations {
                    force_outgoing_ip: self.egg.force_outgoing_ip,
                    default: self.allocation.map(|a| {
                        wings_api::ServerConfigurationAllocationsDefault {
                            ip: a.allocation.ip.ip().to_string(),
                            port: a.allocation.port as u32,
                        }
                    }),
                    mappings: {
                        let mut mappings = IndexMap::new();
                        for allocation in allocations {
                            mappings
                                .entry(allocation.ip.ip().to_string())
                                .or_insert_with(Vec::new)
                                .push(allocation.port as u32);
                        }

                        mappings
                    },
                },
                build: wings_api::ServerConfigurationBuild {
                    memory_limit: self.memory,
                    swap: self.swap,
                    io_weight: self.io_weight.map(|w| w as u32),
                    cpu_limit: self.cpu as i64,
                    disk_space: self.disk as u64,
                    threads: {
                        let mut threads = String::new();
                        for cpu in &self.pinned_cpus {
                            if !threads.is_empty() {
                                threads.push(',');
                            }
                            threads.push_str(&cpu.to_string());
                        }

                        if threads.is_empty() {
                            None
                        } else {
                            Some(threads)
                        }
                    },
                    oom_disabled: true,
                },
                mounts: mounts
                    .into_iter()
                    .map(|m| wings_api::Mount {
                        source: m.source,
                        target: m.target,
                        read_only: m.read_only,
                    })
                    .collect(),
                egg: wings_api::ServerConfigurationEgg {
                    id: self.egg.uuid,
                    file_denylist: self.egg.file_denylist,
                },
                container: wings_api::ServerConfigurationContainer {
                    privileged: false,
                    image: self.image,
                    timezone: self.timezone,
                    seccomp: wings_api::ServerConfigurationContainerSeccomp {
                        remove_allowed: vec![],
                    },
                },
                auto_kill: self.auto_kill,
            },
            process_configuration: super::nest_egg::ProcessConfiguration {
                startup: self.egg.config_startup,
                stop: self.egg.config_stop,
                configs: self.egg.config_files,
            },
        })
    }

    #[inline]
    pub async fn into_admin_api_object(
        self,
        database: &crate::database::Database,
        storage_url_retriever: &StorageUrlRetriever<'_>,
    ) -> Result<AdminApiServer, anyhow::Error> {
        let allocation_uuid = self.allocation.as_ref().map(|a| a.uuid);

        let (node, backup_configuration) = tokio::join!(
            async {
                match self.node.fetch_cached(database).await {
                    Ok(node) => Ok(node.into_admin_api_object(database).await?),
                    Err(err) => Err(err),
                }
            },
            async {
                if let Some(backup_configuration) = self.backup_configuration {
                    if let Ok(backup_configuration) =
                        backup_configuration.fetch_cached(database).await
                    {
                        backup_configuration
                            .into_admin_api_object(database)
                            .await
                            .ok()
                    } else {
                        None
                    }
                } else {
                    None
                }
            }
        );

        Ok(AdminApiServer {
            uuid: self.uuid,
            uuid_short: format!("{:08x}", self.uuid_short),
            external_id: self.external_id,
            allocation: self.allocation.map(|a| a.into_api_object(allocation_uuid)),
            node: node?,
            owner: self.owner.into_api_full_object(storage_url_retriever),
            egg: self.egg.into_admin_api_object(),
            nest: self.nest.into_admin_api_object(),
            backup_configuration,
            status: self.status,
            suspended: self.suspended,
            name: self.name,
            description: self.description,
            limits: ApiServerLimits {
                cpu: self.cpu,
                memory: self.memory,
                swap: self.swap,
                disk: self.disk,
                io_weight: self.io_weight,
            },
            pinned_cpus: self.pinned_cpus,
            feature_limits: ApiServerFeatureLimits {
                allocations: self.allocation_limit,
                databases: self.database_limit,
                backups: self.backup_limit,
                schedules: self.schedule_limit,
            },
            startup: self.startup,
            image: self.image,
            auto_kill: self.auto_kill,
            timezone: self.timezone,
            created: self.created.and_utc(),
        })
    }

    #[inline]
    pub async fn into_api_object(
        self,
        database: &crate::database::Database,
        user: &super::user::User,
    ) -> Result<ApiServer, anyhow::Error> {
        let allocation_uuid = self.allocation.as_ref().map(|a| a.uuid);
        let node = self.node.fetch_cached(database).await?;

        Ok(ApiServer {
            uuid: self.uuid,
            uuid_short: format!("{:08x}", self.uuid_short),
            allocation: self.allocation.map(|a| a.into_api_object(allocation_uuid)),
            egg: self.egg.into_api_object(),
            is_owner: self.owner.uuid == user.uuid,
            permissions: if user.admin {
                vec!["*".to_string()]
            } else {
                self.subuser_permissions
                    .map_or_else(|| vec!["*".to_string()], |p| p.to_vec())
            },
            node_uuid: node.uuid,
            node_name: node.name,
            node_maintenance_message: node.maintenance_message,
            sftp_host: node.sftp_host.unwrap_or_else(|| {
                node.public_url
                    .unwrap_or(node.url)
                    .host_str()
                    .unwrap()
                    .to_string()
            }),
            sftp_port: node.sftp_port,
            status: self.status,
            suspended: self.suspended,
            name: self.name,
            description: self.description,
            limits: ApiServerLimits {
                cpu: self.cpu,
                memory: self.memory,
                swap: self.swap,
                disk: self.disk,
                io_weight: self.io_weight,
            },
            feature_limits: ApiServerFeatureLimits {
                allocations: self.allocation_limit,
                databases: self.database_limit,
                backups: self.backup_limit,
                schedules: self.schedule_limit,
            },
            startup: self.startup,
            image: self.image,
            auto_kill: self.auto_kill,
            timezone: self.timezone,
            created: self.created.and_utc(),
        })
    }
}

#[async_trait::async_trait]
impl ByUuid for Server {
    async fn by_uuid(
        database: &crate::database::Database,
        uuid: uuid::Uuid,
    ) -> Result<Self, sqlx::Error> {
        let row = sqlx::query(&format!(
            r#"
            SELECT {}
            FROM servers
            LEFT JOIN server_allocations ON server_allocations.uuid = servers.allocation_uuid
            LEFT JOIN node_allocations ON node_allocations.uuid = server_allocations.allocation_uuid
            JOIN users ON users.uuid = servers.owner_uuid
            LEFT JOIN roles ON roles.uuid = users.role_uuid
            JOIN nest_eggs ON nest_eggs.uuid = servers.egg_uuid
            JOIN nests ON nests.uuid = nest_eggs.nest_uuid
            WHERE servers.uuid = $1
            "#,
            Self::columns_sql(None)
        ))
        .bind(uuid)
        .fetch_one(database.read())
        .await?;

        Ok(Self::map(None, &row))
    }
}

#[derive(ToSchema, Serialize)]
#[schema(title = "RemoteServer")]
pub struct RemoteApiServer {
    settings: wings_api::ServerConfiguration,
    process_configuration: super::nest_egg::ProcessConfiguration,
}

#[derive(ToSchema, Validate, Serialize, Deserialize)]
pub struct ApiServerLimits {
    #[validate(range(min = 0))]
    #[schema(minimum = 0)]
    pub cpu: i32,
    #[validate(range(min = 0))]
    #[schema(minimum = 0)]
    pub memory: i64,
    #[validate(range(min = -1))]
    #[schema(minimum = -1)]
    pub swap: i64,
    #[validate(range(min = 0))]
    #[schema(minimum = 0)]
    pub disk: i64,
    #[validate(range(min = 0, max = 1000))]
    #[schema(minimum = 0, maximum = 1000)]
    pub io_weight: Option<i16>,
}

#[derive(ToSchema, Validate, Serialize, Deserialize)]
pub struct ApiServerFeatureLimits {
    #[validate(range(min = 0))]
    #[schema(minimum = 0)]
    pub allocations: i32,
    #[validate(range(min = 0))]
    #[schema(minimum = 0)]
    pub databases: i32,
    #[validate(range(min = 0))]
    #[schema(minimum = 0)]
    pub backups: i32,
    #[validate(range(min = 0))]
    #[schema(minimum = 0)]
    pub schedules: i32,
}

#[derive(ToSchema, Serialize)]
#[schema(title = "AdminServer")]
pub struct AdminApiServer {
    pub uuid: uuid::Uuid,
    pub uuid_short: String,
    pub external_id: Option<String>,
    pub allocation: Option<super::server_allocation::ApiServerAllocation>,
    pub node: super::node::AdminApiNode,
    pub owner: super::user::ApiFullUser,
    pub egg: super::nest_egg::AdminApiNestEgg,
    pub nest: super::nest::AdminApiNest,
    pub backup_configuration: Option<super::backup_configurations::AdminApiBackupConfiguration>,

    pub status: Option<ServerStatus>,
    pub suspended: bool,

    pub name: String,
    pub description: Option<String>,

    #[schema(inline)]
    pub limits: ApiServerLimits,
    pub pinned_cpus: Vec<i16>,
    #[schema(inline)]
    pub feature_limits: ApiServerFeatureLimits,

    pub startup: String,
    pub image: String,
    #[schema(inline)]
    pub auto_kill: wings_api::ServerConfigurationAutoKill,
    pub timezone: Option<String>,

    pub created: chrono::DateTime<chrono::Utc>,
}

#[derive(ToSchema, Serialize)]
#[schema(title = "Server")]
pub struct ApiServer {
    pub uuid: uuid::Uuid,
    pub uuid_short: String,
    pub allocation: Option<super::server_allocation::ApiServerAllocation>,
    pub egg: super::nest_egg::ApiNestEgg,

    pub status: Option<ServerStatus>,
    pub suspended: bool,

    pub is_owner: bool,
    pub permissions: Vec<String>,

    pub node_uuid: uuid::Uuid,
    pub node_name: String,
    pub node_maintenance_message: Option<String>,

    pub sftp_host: String,
    pub sftp_port: i32,

    pub name: String,
    pub description: Option<String>,

    #[schema(inline)]
    pub limits: ApiServerLimits,
    #[schema(inline)]
    pub feature_limits: ApiServerFeatureLimits,

    pub startup: String,
    pub image: String,
    #[schema(inline)]
    pub auto_kill: wings_api::ServerConfigurationAutoKill,
    pub timezone: Option<String>,

    pub created: chrono::DateTime<chrono::Utc>,
}
