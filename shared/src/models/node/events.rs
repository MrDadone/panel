use crate::models::EventEmittingModel;
use std::sync::LazyLock;

#[non_exhaustive]
pub enum NodeEvent {
    /// Emitted when a node's token is reset.
    TokenReset {
        node: Box<super::Node>,
        token_id: String,
        token: String,
    },
    /// Emitted when wings restarts, the base panel uses this to fail backups and transfers in progress.
    /// Importantly, the base panel does not use this for failing server installations, wings tries hard to resume those on restart.
    StateReset { node: Box<super::Node> },
}

#[async_trait::async_trait]
impl EventEmittingModel for super::Node {
    type Event = NodeEvent;

    fn get_event_emitter() -> &'static crate::events::EventEmitter<Self::Event> {
        static EVENT_EMITTER: LazyLock<crate::events::EventEmitter<NodeEvent>> =
            LazyLock::new(crate::events::EventEmitter::default);

        &EVENT_EMITTER
    }
}
