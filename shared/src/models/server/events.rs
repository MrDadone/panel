use crate::models::EventEmittingModel;
use std::sync::LazyLock;

#[non_exhaustive]
pub enum ServerEvent {
    /// Emitted when a server transfer starts.
    TransferStarted {
        server: Box<super::Server>,
        destination_node: Box<crate::models::node::Node>,
        destination_allocation: Option<uuid::Uuid>,
        destination_allocations: Vec<uuid::Uuid>,
    },
    /// Emitted when a server transfer completes, either successfully or unsuccessfully.
    TransferCompleted {
        server: Box<super::Server>,
        destination_node: Box<crate::models::node::Node>,
        successful: bool,
    },
    /// Emitted when a server installation starts.
    InstallStarted {
        server: Box<super::Server>,
        installation_script: Box<wings_api::InstallationScript>,
    },
    /// Emitted when a server installation completes, either successfully or unsuccessfully.
    InstallCompleted {
        server: Box<super::Server>,
        successful: bool,
    },
    /// Emitted when a server's state is reset manually (such as via an API call).
    /// If you handle this you might also want to handle `NodeEvent::StateReset` as well. (Called when the node restarts)
    StateReset { server: Box<super::Server> },
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
