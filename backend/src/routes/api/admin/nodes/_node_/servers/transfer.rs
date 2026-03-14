use super::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod post {
    use axum::http::StatusCode;
    use serde::{Deserialize, Serialize};
    use shared::{
        ApiError, GetState,
        models::{
            ByUuid,
            admin_activity::GetAdminActivityLogger,
            node::{GetNode, Node},
            node_allocation::NodeAllocation,
            server::Server,
            server_allocation::ServerAllocation,
            server_backup::ServerBackup,
            user::GetPermissionManager,
        },
        response::{ApiResponse, ApiResponseResult},
    };
    use std::collections::HashSet;
    use utoipa::ToSchema;

    #[derive(ToSchema, Deserialize)]
    pub struct Payload {
        servers: HashSet<uuid::Uuid>,
        node_uuid: uuid::Uuid,

        allocation_uuid_random: bool,
        allocation_uuids_random: bool,
        allocation_respect_egg_port_range: bool,

        transfer_backups: bool,
        delete_source_backups: bool,
        archive_format: wings_api::TransferArchiveFormat,
        compression_level: Option<wings_api::CompressionLevel>,
        multiplex_channels: u64,
    }

    #[derive(ToSchema, Serialize)]
    struct Response {
        affected: u64,
    }

    #[utoipa::path(post, path = "/", responses(
        (status = ACCEPTED, body = inline(Response)),
        (status = UNAUTHORIZED, body = ApiError),
    ), params(
        (
            "node" = uuid::Uuid,
            description = "The node ID",
            example = "123e4567-e89b-12d3-a456-426614174000",
        ),
    ), request_body = inline(Payload))]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        node: GetNode,
        activity_logger: GetAdminActivityLogger,
        shared::Payload(data): shared::Payload<Payload>,
    ) -> ApiResponseResult {
        permissions.has_admin_permission("nodes.transfers")?;

        if data.node_uuid == node.uuid {
            return ApiResponse::error("cannot transfer servers to the same node")
                .with_status(StatusCode::CONFLICT)
                .ok();
        }

        let destination_node = match Node::by_uuid_optional(&state.database, data.node_uuid).await?
        {
            Some(node) => node,
            None => {
                return ApiResponse::error("node not found")
                    .with_status(StatusCode::NOT_FOUND)
                    .ok();
            }
        };

        let mut affected = 0;

        let mut transfer_server = async |server: Server| {
            if server.destination_node.is_some() {
                return Ok(());
            }

            let backups = if data.transfer_backups {
                ServerBackup::all_uuids_by_server_uuid(&state.database, server.uuid).await?
            } else {
                Vec::new()
            };

            let (needs_primary, required_allocation_count) = if data.allocation_uuids_random {
                let count =
                    ServerAllocation::count_by_server_uuid(&state.database, server.uuid).await;
                if data.allocation_uuid_random {
                    (true, count)
                } else {
                    (false, count.saturating_sub(1))
                }
            } else if data.allocation_uuid_random && server.allocation.is_some() {
                (true, 1)
            } else {
                (false, 0)
            };

            let node_allocations = NodeAllocation::get_random(
                &state.database,
                destination_node.uuid,
                if data.allocation_respect_egg_port_range {
                    server.egg.config_allocations.user_self_assign.start_port
                } else {
                    1
                },
                if data.allocation_respect_egg_port_range {
                    server.egg.config_allocations.user_self_assign.end_port
                } else {
                    u16::MAX
                },
                required_allocation_count,
            )
            .await?;

            let mut allocation_uuid = None;
            let mut allocation_uuids = Vec::new();

            for (i, node_allocation_uuid) in node_allocations.into_iter().enumerate() {
                if needs_primary && i == 0 {
                    allocation_uuid = Some(node_allocation_uuid);
                } else {
                    allocation_uuids.push(node_allocation_uuid);
                }
            }

            server
                .transfer(
                    &state,
                    shared::models::server::ServerTransferOptions {
                        destination_node: destination_node.clone(),
                        allocation_uuid,
                        allocation_uuids,
                        backups,
                        delete_source_backups: data.delete_source_backups,
                        archive_format: data.archive_format,
                        compression_level: data.compression_level,
                        multiplex_channels: data.multiplex_channels,
                    },
                )
                .await?;

            affected += 1;

            Ok::<_, anyhow::Error>(())
        };

        if data.servers.is_empty() {
            let mut server_page = 1;
            loop {
                let servers = Server::by_node_uuid_with_pagination(
                    &state.database,
                    node.uuid,
                    server_page,
                    50,
                    None,
                )
                .await?;
                if servers.data.is_empty() {
                    break;
                }

                for server in servers.data {
                    transfer_server(server).await?;
                }

                server_page += 1;
            }
        } else {
            for server_uuid in data.servers.iter() {
                let server = match Server::by_uuid_optional(&state.database, *server_uuid).await? {
                    Some(server) => server,
                    None => continue,
                };

                if server.node.uuid != node.uuid {
                    continue;
                }

                transfer_server(server).await?;
            }
        }

        activity_logger
            .log(
                "node:servers.transfer",
                serde_json::json!({
                    "node_uuid": node.uuid,
                    "servers": if data.servers.is_empty() { None } else { Some(&data.servers) },
                    "destination_node_uuid": data.node_uuid,
                }),
            )
            .await;

        ApiResponse::new_serialized(Response { affected })
            .with_status(StatusCode::ACCEPTED)
            .ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(post::route))
        .with_state(state.clone())
}
