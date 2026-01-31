use crate::models::EventEmittingModel;
use std::sync::LazyLock;

pub enum ServerEvent {
    TransferStarted {
        server: Box<super::Server>,
        destination_node: Box<crate::models::node::Node>,
        destination_allocation: Option<uuid::Uuid>,
        destination_allocations: Vec<uuid::Uuid>,
    },
    TransferCompleted {
        server: Box<super::Server>,
        destination_node: Box<crate::models::node::Node>,
        successful: bool,
    },
    InstallStarted {
        server: Box<super::Server>,
        installation_script: Box<wings_api::InstallationScript>,
    },
    InstallCompleted {
        server: Box<super::Server>,
        successful: bool,
    },
}

#[async_trait::async_trait]
impl EventEmittingModel for super::Server {
    type Event = ServerEvent;

    fn get_event_emitter() -> &'static crate::events::EventEmitter<Self::Event> {
        static EVENT_EMITTER: LazyLock<crate::events::EventEmitter<ServerEvent>> =
            LazyLock::new(crate::events::EventEmitter::default);

        &EVENT_EMITTER
    }
}
