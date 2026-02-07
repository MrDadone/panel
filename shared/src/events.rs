use futures_util::StreamExt;
use std::{collections::HashMap, pin::Pin, sync::Arc};
use tokio::sync::RwLock;

type Listener<Event> = dyn Fn(
        crate::State,
        Arc<Event>,
    ) -> Pin<Box<dyn Future<Output = Result<(), anyhow::Error>> + Send + 'static>>
    + Send
    + Sync;

#[derive(Clone)]
pub struct EventHandlerHandle {
    listeners_ref: Arc<dyn DisconnectEventHandler + Send + Sync>,
    id: uuid::Uuid,
}

impl EventHandlerHandle {
    #[inline]
    pub async fn disconnect(self) {
        self.listeners_ref.disconnect(self.id).await;
    }

    /// # Warning
    /// This method will block the current thread if the lock is not available
    #[inline]
    pub fn blocking_disconnect(self) {
        self.listeners_ref.blocking_disconnect(self.id);
    }
}

#[async_trait::async_trait]
pub(crate) trait DisconnectEventHandler {
    async fn disconnect(&self, id: uuid::Uuid);
    fn blocking_disconnect(&self, id: uuid::Uuid);
}

#[async_trait::async_trait]
impl<Event> DisconnectEventHandler for RwLock<HashMap<uuid::Uuid, Box<Listener<Event>>>> {
    #[inline]
    async fn disconnect(&self, id: uuid::Uuid) {
        self.write().await.remove(&id);
    }

    #[inline]
    fn blocking_disconnect(&self, id: uuid::Uuid) {
        self.blocking_write().remove(&id);
    }
}

pub struct EventEmitter<Event: 'static + Send + Sync> {
    listeners: Arc<RwLock<HashMap<uuid::Uuid, Box<Listener<Event>>>>>,
    event_channel: tokio::sync::mpsc::Sender<(crate::State, Event)>,
    task: tokio::task::JoinHandle<()>,
}

impl<Event: 'static + Send + Sync> Default for EventEmitter<Event> {
    fn default() -> Self {
        let listeners = Arc::new(RwLock::new(HashMap::new()));
        let (event_channel_sender, mut event_channel_receiver) = tokio::sync::mpsc::channel(64);

        Self {
            listeners: listeners.clone(),
            event_channel: event_channel_sender,
            task: tokio::spawn(async move {
                let semaphore = Arc::new(tokio::sync::Semaphore::new(8));

                while let Some((state, event)) = event_channel_receiver.recv().await {
                    tracing::debug!("emitting event {:?}", std::any::type_name::<Event>());

                    let listeners = listeners.clone();
                    let permit = match semaphore.clone().acquire_owned().await {
                        Ok(permit) => permit,
                        Err(_) => {
                            tracing::error!("semaphore closed, shutting down event emitter");
                            break;
                        }
                    };

                    tokio::spawn(async move {
                        let event = Arc::new(event);
                        let listeners = listeners
                            .read()
                            .await
                            .values()
                            .map(|listener| listener(state.clone(), event.clone()))
                            .collect::<Vec<_>>();

                        let mut result_stream =
                            futures_util::stream::iter(listeners).buffer_unordered(8);

                        while let Some(result) = result_stream.next().await {
                            if let Err(err) = result {
                                tracing::error!(
                                    "event listener error for {:?}: {:?}",
                                    std::any::type_name::<Event>(),
                                    err
                                );
                            }
                        }

                        drop(permit);
                    });
                }
            }),
        }
    }
}

impl<Event: 'static + Send + Sync> EventEmitter<Event> {
    pub async fn register_event_handler<
        F: Fn(crate::State, Arc<Event>) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<(), anyhow::Error>> + Send + 'static,
    >(
        &self,
        listener: F,
    ) -> EventHandlerHandle {
        let id = uuid::Uuid::new_v4();
        let listener_box = Box::new(move |state: crate::State, event: Arc<Event>| {
            Box::pin(listener(state, event))
                as Pin<Box<dyn Future<Output = Result<(), anyhow::Error>> + Send + 'static>>
        }) as Box<Listener<Event>>;

        self.listeners.write().await.insert(id, listener_box);

        EventHandlerHandle {
            listeners_ref: self.listeners.clone(),
            id,
        }
    }

    /// # Warning
    /// This method will block the current thread if the lock is not available
    pub fn blocking_register_event_handler<
        F: Fn(crate::State, Arc<Event>) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<(), anyhow::Error>> + Send + 'static,
    >(
        &self,
        listener: F,
    ) -> EventHandlerHandle {
        let id = uuid::Uuid::new_v4();
        let listener_box = Box::new(move |state: crate::State, event: Arc<Event>| {
            Box::pin(listener(state, event))
                as Pin<Box<dyn Future<Output = Result<(), anyhow::Error>> + Send + 'static>>
        }) as Box<Listener<Event>>;

        self.listeners.blocking_write().insert(id, listener_box);

        EventHandlerHandle {
            listeners_ref: self.listeners.clone(),
            id,
        }
    }

    #[inline]
    pub fn emit(&self, state: crate::State, event: Event) {
        let _ = self.event_channel.try_send((state, event));
    }
}

impl<Event: 'static + Send + Sync> Drop for EventEmitter<Event> {
    #[inline]
    fn drop(&mut self) {
        self.task.abort();
    }
}
