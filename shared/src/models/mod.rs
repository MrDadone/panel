use crate::database::DatabaseError;
use compact_str::CompactStringExt;
use futures_util::{StreamExt, TryStreamExt};
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use sqlx::{
    Arguments, Postgres, QueryBuilder, Row,
    postgres::{PgArguments, PgRow},
};
use std::{
    collections::{BTreeMap, HashSet},
    marker::PhantomData,
    pin::Pin,
    sync::{Arc, LazyLock},
};
use tokio::sync::RwLock;
use utoipa::ToSchema;
use validator::Validate;

pub mod admin_activity;
pub mod backup_configuration;
pub mod database_host;
pub mod egg_repository;
pub mod egg_repository_egg;
pub mod location;
pub mod location_database_host;
pub mod mount;
pub mod nest;
pub mod nest_egg;
pub mod nest_egg_mount;
pub mod nest_egg_variable;
pub mod node;
pub mod node_allocation;
pub mod node_mount;
pub mod oauth_provider;
pub mod role;
pub mod server;
pub mod server_activity;
pub mod server_allocation;
pub mod server_backup;
pub mod server_database;
pub mod server_mount;
pub mod server_schedule;
pub mod server_schedule_step;
pub mod server_subuser;
pub mod server_variable;
pub mod user;
pub mod user_activity;
pub mod user_api_key;
pub mod user_oauth_link;
pub mod user_password_reset;
pub mod user_recovery_code;
pub mod user_security_key;
pub mod user_server_group;
pub mod user_session;
pub mod user_ssh_key;

#[derive(ToSchema, Validate, Deserialize)]
pub struct PaginationParams {
    #[validate(range(min = 1))]
    #[schema(minimum = 1)]
    #[serde(default = "Pagination::default_page")]
    pub page: i64,
    #[validate(range(min = 1, max = 100))]
    #[schema(minimum = 1, maximum = 100)]
    #[serde(default = "Pagination::default_per_page")]
    pub per_page: i64,
}

#[derive(ToSchema, Validate, Deserialize)]
pub struct PaginationParamsWithSearch {
    #[validate(range(min = 1))]
    #[schema(minimum = 1)]
    #[serde(default = "Pagination::default_page")]
    pub page: i64,
    #[validate(range(min = 1, max = 100))]
    #[schema(minimum = 1, maximum = 100)]
    #[serde(default = "Pagination::default_per_page")]
    pub per_page: i64,
    #[validate(length(min = 1, max = 128))]
    #[schema(min_length = 1, max_length = 128)]
    #[serde(
        default,
        deserialize_with = "crate::deserialize::deserialize_string_option"
    )]
    pub search: Option<compact_str::CompactString>,
}

#[derive(ToSchema, Serialize)]
pub struct Pagination<T: Serialize = serde_json::Value> {
    pub total: i64,
    pub per_page: i64,
    pub page: i64,

    pub data: Vec<T>,
}

impl Pagination {
    #[inline]
    pub const fn default_page() -> i64 {
        1
    }

    #[inline]
    pub const fn default_per_page() -> i64 {
        25
    }
}

impl<T: Serialize> Pagination<T> {
    pub async fn async_map<R: serde::Serialize, Fut: Future<Output = R>>(
        self,
        mapper: impl Fn(T) -> Fut,
    ) -> Pagination<R> {
        let mut results = Vec::new();
        results.reserve_exact(self.data.len());
        let mut result_stream =
            futures_util::stream::iter(self.data.into_iter().map(mapper)).buffered(25);

        while let Some(result) = result_stream.next().await {
            results.push(result);
        }

        Pagination {
            total: self.total,
            per_page: self.per_page,
            page: self.page,
            data: results,
        }
    }

    pub async fn try_async_map<R: serde::Serialize, E, Fut: Future<Output = Result<R, E>>>(
        self,
        mapper: impl Fn(T) -> Fut,
    ) -> Result<Pagination<R>, E> {
        let mut results = Vec::new();
        results.reserve_exact(self.data.len());
        let mut result_stream =
            futures_util::stream::iter(self.data.into_iter().map(mapper)).buffered(25);

        while let Some(result) = result_stream.try_next().await? {
            results.push(result);
        }

        Ok(Pagination {
            total: self.total,
            per_page: self.per_page,
            page: self.page,
            data: results,
        })
    }
}

pub trait BaseModel: Serialize + DeserializeOwned {
    const NAME: &'static str;

    fn columns(prefix: Option<&str>) -> BTreeMap<&'static str, compact_str::CompactString>;

    #[inline]
    fn columns_sql(prefix: Option<&str>) -> compact_str::CompactString {
        Self::columns(prefix)
            .iter()
            .map(|(key, value)| compact_str::format_compact!("{key} as {value}"))
            .join_compact(", ")
    }

    fn map(prefix: Option<&str>, row: &PgRow) -> Result<Self, crate::database::DatabaseError>;
}

#[async_trait::async_trait]
pub trait EventEmittingModel: BaseModel {
    type Event: Send + Sync + 'static;

    fn get_event_emitter() -> &'static crate::events::EventEmitter<Self::Event>;

    async fn register_event_handler<
        F: Fn(crate::State, Arc<Self::Event>) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<(), anyhow::Error>> + Send + 'static,
    >(
        listener: F,
    ) -> crate::events::EventHandlerHandle {
        Self::get_event_emitter()
            .register_event_handler(listener)
            .await
    }

    /// # Warning
    /// This method will block the current thread if the lock is not available
    fn blocking_register_event_handler<
        F: Fn(crate::State, Arc<Self::Event>) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<(), anyhow::Error>> + Send + 'static,
    >(
        listener: F,
    ) -> crate::events::EventHandlerHandle {
        Self::get_event_emitter().blocking_register_event_handler(listener)
    }
}

type CreateListenerResult<'a> =
    Pin<Box<dyn Future<Output = Result<(), crate::database::DatabaseError>> + Send + 'a>>;
type CreateListener<M> = dyn for<'a> Fn(
        &'a mut <M as CreatableModel>::CreateOptions<'_>,
        &'a mut InsertQueryBuilder,
        &'a crate::State,
        &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
    ) -> CreateListenerResult<'a>
    + Send
    + Sync;
pub type CreateListenerList<M> = Arc<ModelHandlerList<Box<CreateListener<M>>>>;

#[async_trait::async_trait]
pub trait CreatableModel: BaseModel + Send + Sync + 'static {
    type CreateOptions<'a>: Send + Sync + Validate;
    type CreateResult: Send;

    fn get_create_handlers() -> &'static LazyLock<CreateListenerList<Self>>;

    async fn register_create_handler<
        F: for<'a> Fn(
                &'a mut Self::CreateOptions<'_>,
                &'a mut InsertQueryBuilder,
                &'a crate::State,
                &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
            ) -> Pin<
                Box<dyn Future<Output = Result<(), crate::database::DatabaseError>> + Send + 'a>,
            > + Send
            + Sync
            + 'static,
    >(
        priority: ListenerPriority,
        callback: F,
    ) {
        let erased = Box::new(callback) as Box<CreateListener<Self>>;

        Self::get_create_handlers()
            .register_handler(priority, erased)
            .await;
    }

    /// # Warning
    /// This method will block the current thread if the lock is not available
    fn blocking_register_create_handler<
        F: for<'a> Fn(
                &'a mut Self::CreateOptions<'_>,
                &'a mut InsertQueryBuilder,
                &'a crate::State,
                &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
            ) -> Pin<
                Box<dyn Future<Output = Result<(), crate::database::DatabaseError>> + Send + 'a>,
            > + Send
            + Sync
            + 'static,
    >(
        priority: ListenerPriority,
        callback: F,
    ) {
        let erased = Box::new(callback) as Box<CreateListener<Self>>;

        Self::get_create_handlers().blocking_register_handler(priority, erased);
    }

    async fn run_create_handlers(
        options: &mut Self::CreateOptions<'_>,
        query_builder: &mut InsertQueryBuilder,
        state: &crate::State,
        transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    ) -> Result<(), crate::database::DatabaseError> {
        let listeners = Self::get_create_handlers().listeners.read().await;

        for listener in listeners.iter() {
            (*listener.callback)(options, query_builder, state, transaction).await?;
        }

        Ok(())
    }

    async fn create(
        state: &crate::State,
        options: Self::CreateOptions<'_>,
    ) -> Result<Self::CreateResult, crate::database::DatabaseError>;
}

type UpdateListenerResult<'a> =
    Pin<Box<dyn Future<Output = Result<(), crate::database::DatabaseError>> + Send + 'a>>;
type UpdateListener<M> = dyn for<'a> Fn(
        &'a mut M,
        &'a mut <M as UpdatableModel>::UpdateOptions,
        &'a mut UpdateQueryBuilder,
        &'a crate::State,
        &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
    ) -> UpdateListenerResult<'a>
    + Send
    + Sync;
pub type UpdateListenerList<M> = Arc<ModelHandlerList<Box<UpdateListener<M>>>>;

#[async_trait::async_trait]
pub trait UpdatableModel: BaseModel + Send + Sync + 'static {
    type UpdateOptions: Send + Sync + Default + ToSchema + DeserializeOwned + Serialize + Validate;

    fn get_update_handlers() -> &'static LazyLock<UpdateListenerList<Self>>;

    async fn register_update_handler<
        F: for<'a> Fn(
                &'a mut Self,
                &'a mut Self::UpdateOptions,
                &'a mut UpdateQueryBuilder,
                &'a crate::State,
                &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
            ) -> Pin<
                Box<dyn Future<Output = Result<(), crate::database::DatabaseError>> + Send + 'a>,
            > + Send
            + Sync
            + 'static,
    >(
        priority: ListenerPriority,
        callback: F,
    ) {
        let erased = Box::new(callback) as Box<UpdateListener<Self>>;

        Self::get_update_handlers()
            .register_handler(priority, erased)
            .await;
    }

    /// # Warning
    /// This method will block the current thread if the lock is not available
    fn blocking_register_update_handler<
        F: for<'a> Fn(
                &'a mut Self,
                &'a mut Self::UpdateOptions,
                &'a mut UpdateQueryBuilder,
                &'a crate::State,
                &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
            ) -> Pin<
                Box<dyn Future<Output = Result<(), crate::database::DatabaseError>> + Send + 'a>,
            > + Send
            + Sync
            + 'static,
    >(
        priority: ListenerPriority,
        callback: F,
    ) {
        let erased = Box::new(callback) as Box<UpdateListener<Self>>;

        Self::get_update_handlers().blocking_register_handler(priority, erased);
    }

    async fn run_update_handlers(
        &mut self,
        options: &mut Self::UpdateOptions,
        query_builder: &mut UpdateQueryBuilder,
        state: &crate::State,
        transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    ) -> Result<(), crate::database::DatabaseError> {
        let listeners = Self::get_update_handlers().listeners.read().await;

        for listener in listeners.iter() {
            (*listener.callback)(self, options, query_builder, state, transaction).await?;
        }

        Ok(())
    }

    async fn update(
        &mut self,
        state: &crate::State,
        options: Self::UpdateOptions,
    ) -> Result<(), crate::database::DatabaseError>;
}

type DeleteListenerResult<'a> =
    Pin<Box<dyn Future<Output = Result<(), anyhow::Error>> + Send + 'a>>;
type DeleteListener<M> = dyn for<'a> Fn(
        &'a M,
        &'a <M as DeletableModel>::DeleteOptions,
        &'a crate::State,
        &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
    ) -> DeleteListenerResult<'a>
    + Send
    + Sync;
pub type DeleteListenerList<M> = Arc<ModelHandlerList<Box<DeleteListener<M>>>>;

#[async_trait::async_trait]
pub trait DeletableModel: BaseModel + Send + Sync + 'static {
    type DeleteOptions: Send + Sync + Default;

    fn get_delete_handlers() -> &'static LazyLock<DeleteListenerList<Self>>;

    async fn register_delete_handler<
        F: for<'a> Fn(
                &'a Self,
                &'a Self::DeleteOptions,
                &'a crate::State,
                &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
            )
                -> Pin<Box<dyn Future<Output = Result<(), anyhow::Error>> + Send + 'a>>
            + Send
            + Sync
            + 'static,
    >(
        priority: ListenerPriority,
        callback: F,
    ) {
        let erased = Box::new(callback) as Box<DeleteListener<Self>>;

        Self::get_delete_handlers()
            .register_handler(priority, erased)
            .await;
    }

    /// # Warning
    /// This method will block the current thread if the lock is not available
    fn blocking_register_delete_handler<
        F: for<'a> Fn(
                &'a Self,
                &'a Self::DeleteOptions,
                &'a crate::State,
                &'a mut sqlx::Transaction<'_, sqlx::Postgres>,
            )
                -> Pin<Box<dyn Future<Output = Result<(), anyhow::Error>> + Send + 'a>>
            + Send
            + Sync
            + 'static,
    >(
        priority: ListenerPriority,
        callback: F,
    ) {
        let erased = Box::new(callback) as Box<DeleteListener<Self>>;

        Self::get_delete_handlers().blocking_register_handler(priority, erased);
    }

    async fn run_delete_handlers(
        &self,
        options: &Self::DeleteOptions,
        state: &crate::State,
        transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    ) -> Result<(), anyhow::Error> {
        let listeners = Self::get_delete_handlers().listeners.read().await;

        for listener in listeners.iter() {
            (*listener.callback)(self, options, state, transaction).await?;
        }

        Ok(())
    }

    async fn delete(
        &self,
        state: &crate::State,
        options: Self::DeleteOptions,
    ) -> Result<(), anyhow::Error>;
}

#[async_trait::async_trait]
pub trait ByUuid: BaseModel {
    async fn by_uuid(
        database: &crate::database::Database,
        uuid: uuid::Uuid,
    ) -> Result<Self, DatabaseError>;

    async fn by_uuid_cached(
        database: &crate::database::Database,
        uuid: uuid::Uuid,
    ) -> Result<Self, anyhow::Error> {
        database
            .cache
            .cached(&format!("{}::{uuid}", Self::NAME), 10, || {
                Self::by_uuid(database, uuid)
            })
            .await
    }

    async fn by_uuid_optional(
        database: &crate::database::Database,
        uuid: uuid::Uuid,
    ) -> Result<Option<Self>, DatabaseError> {
        match Self::by_uuid(database, uuid).await {
            Ok(res) => Ok(Some(res)),
            Err(DatabaseError::Sqlx(sqlx::Error::RowNotFound)) => Ok(None),
            Err(err) => Err(err),
        }
    }

    async fn by_uuid_optional_cached(
        database: &crate::database::Database,
        uuid: uuid::Uuid,
    ) -> Result<Option<Self>, anyhow::Error> {
        match Self::by_uuid_cached(database, uuid).await {
            Ok(res) => Ok(Some(res)),
            Err(err) => {
                if let Some(sqlx::Error::RowNotFound) = err.downcast_ref::<sqlx::Error>() {
                    Ok(None)
                } else {
                    Err(err)
                }
            }
        }
    }

    #[inline]
    fn get_fetchable(uuid: uuid::Uuid) -> Fetchable<Self> {
        Fetchable {
            uuid,
            _model: PhantomData,
        }
    }

    #[inline]
    fn get_fetchable_from_row(row: &PgRow, column: impl AsRef<str>) -> Option<Fetchable<Self>> {
        match row.try_get(column.as_ref()) {
            Ok(uuid) => Some(Fetchable {
                uuid,
                _model: PhantomData,
            }),
            Err(_) => None,
        }
    }
}

#[derive(Default, Debug, Clone, Copy, PartialEq, Eq)]
pub enum ListenerPriority {
    Highest,
    High,
    #[default]
    Normal,
    Low,
    Lowest,
}

impl ListenerPriority {
    #[inline]
    fn rank(self) -> u8 {
        match self {
            Self::Highest => 5,
            Self::High => 4,
            Self::Normal => 3,
            Self::Low => 2,
            Self::Lowest => 1,
        }
    }
}

impl PartialOrd for ListenerPriority {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for ListenerPriority {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        let self_rank = self.rank();
        let other_rank = other.rank();

        other_rank.cmp(&self_rank)
    }
}

#[async_trait::async_trait]
impl<F: Send + Sync> crate::events::DisconnectEventHandler for ModelHandlerList<F> {
    #[inline]
    async fn disconnect(&self, id: uuid::Uuid) {
        self.listeners.write().await.retain(|l| l.uuid != id);
    }

    #[inline]
    fn blocking_disconnect(&self, id: uuid::Uuid) {
        self.listeners.blocking_write().retain(|l| l.uuid != id);
    }
}

pub struct ModelHandlerList<F: Send + Sync + 'static> {
    listeners: RwLock<Vec<ModelHandler<F>>>,
}

impl<F: Send + Sync + 'static> Default for ModelHandlerList<F> {
    fn default() -> Self {
        Self {
            listeners: RwLock::new(Vec::new()),
        }
    }
}

impl<F: Send + Sync + 'static> ModelHandlerList<F> {
    pub async fn register_handler(
        self: &Arc<Self>,
        priority: ListenerPriority,
        callback: F,
    ) -> ModelHandlerHandle {
        let listener = ModelHandler::new(callback, priority, self.clone());
        let aborter = listener.handle();

        let mut self_listeners = self.listeners.write().await;
        self_listeners.push(listener);
        self_listeners.sort_by(|a, b| a.priority.cmp(&b.priority));

        aborter
    }

    /// # Warning
    /// This method will block the current thread if the lock is not available
    pub fn blocking_register_handler(
        self: &Arc<Self>,
        priority: ListenerPriority,
        callback: F,
    ) -> ModelHandlerHandle {
        let listener = ModelHandler::new(callback, priority, self.clone());
        let aborter = listener.handle();

        let mut self_listeners = self.listeners.blocking_write();
        self_listeners.push(listener);
        self_listeners.sort_by(|a, b| a.priority.cmp(&b.priority));

        aborter
    }
}

pub struct ModelHandler<F: Send + Sync + 'static> {
    uuid: uuid::Uuid,
    priority: ListenerPriority,
    list: Arc<ModelHandlerList<F>>,

    pub callback: F,
}

impl<F: Send + Sync + 'static> ModelHandler<F> {
    pub fn new(callback: F, priority: ListenerPriority, list: Arc<ModelHandlerList<F>>) -> Self {
        Self {
            uuid: uuid::Uuid::new_v4(),
            priority,
            list,
            callback,
        }
    }

    pub fn handle(&self) -> ModelHandlerHandle {
        ModelHandlerHandle {
            list_ref: self.list.clone(),
            id: self.uuid,
        }
    }
}

pub struct ModelHandlerHandle {
    list_ref: Arc<dyn crate::events::DisconnectEventHandler + Send + Sync>,
    id: uuid::Uuid,
}

impl ModelHandlerHandle {
    pub async fn disconnect(&self) {
        self.list_ref.disconnect(self.id).await;
    }

    /// # Warning
    /// This method will block the current thread if the lists' lock is not available
    pub fn blocking_disconnect(&self) {
        self.list_ref.blocking_disconnect(self.id);
    }
}

#[derive(Serialize, Deserialize, Clone, Copy)]
pub struct Fetchable<M: ByUuid> {
    pub uuid: uuid::Uuid,
    #[serde(skip)]
    _model: PhantomData<M>,
}

impl<M: ByUuid + Send> Fetchable<M> {
    #[inline]
    pub async fn fetch(&self, database: &crate::database::Database) -> Result<M, DatabaseError> {
        M::by_uuid(database, self.uuid).await
    }

    #[inline]
    pub async fn fetch_cached(
        &self,
        database: &crate::database::Database,
    ) -> Result<M, anyhow::Error> {
        M::by_uuid_cached(database, self.uuid).await
    }

    #[inline]
    pub async fn fetch_optional(
        &self,
        database: &crate::database::Database,
    ) -> Result<Option<M>, DatabaseError> {
        M::by_uuid_optional(database, self.uuid).await
    }

    #[inline]
    pub async fn fetch_optional_cached(
        &self,
        database: &crate::database::Database,
    ) -> Result<Option<M>, anyhow::Error> {
        M::by_uuid_optional_cached(database, self.uuid).await
    }
}

pub struct InsertQueryBuilder<'a> {
    table: &'a str,
    columns: Vec<&'a str>,
    expressions: Vec<String>,
    arguments: PgArguments,
    returning_clause: Option<&'a str>,
}

impl<'a> InsertQueryBuilder<'a> {
    pub fn new(table: &'a str) -> Self {
        Self {
            table,
            columns: Vec::new(),
            expressions: Vec::new(),
            arguments: PgArguments::default(),
            returning_clause: None,
        }
    }

    pub fn set<T: 'a + sqlx::Encode<'a, Postgres> + sqlx::Type<Postgres> + Send>(
        &mut self,
        column: &'a str,
        value: T,
    ) -> &mut Self {
        if self.columns.contains(&column) {
            return self;
        }

        if self.arguments.add(value).is_ok() {
            self.columns.push(column);
            let idx = self.arguments.len();
            self.expressions.push(format!("${}", idx));
        }

        self
    }

    pub fn set_expr<T: 'a + sqlx::Encode<'a, Postgres> + sqlx::Type<Postgres> + Send>(
        &mut self,
        column: &'a str,
        expression: &str,
        values: Vec<T>,
    ) -> &mut Self {
        if self.columns.contains(&column) {
            return self;
        }

        let start_len = self.arguments.len();

        for value in values {
            if self.arguments.add(value).is_err() {
                return self;
            }
        }

        let mut expr = expression.to_string();
        let added_count = self.arguments.len() - start_len;

        for i in (1..=added_count).rev() {
            let global_idx = start_len + i;
            expr = expr.replace(&format!("${}", i), &format!("${}", global_idx));
        }

        self.columns.push(column);
        self.expressions.push(expr);

        self
    }

    pub fn returning(mut self, clause: &'a str) -> Self {
        self.returning_clause = Some(clause);
        self
    }

    fn build_sql(&self) -> String {
        let columns_sql = self.columns.join(", ");
        let values_sql = self.expressions.join(", ");

        let mut sql = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            self.table, columns_sql, values_sql
        );

        if let Some(clause) = self.returning_clause {
            sql.push_str(" RETURNING ");
            sql.push_str(clause);
        }

        sql
    }

    pub async fn execute(
        self,
        executor: impl sqlx::Executor<'a, Database = Postgres>,
    ) -> Result<sqlx::postgres::PgQueryResult, sqlx::Error> {
        let sql = self.build_sql();
        sqlx::query_with(&sql, self.arguments)
            .execute(executor)
            .await
    }

    pub async fn fetch_one(
        self,
        executor: impl sqlx::Executor<'a, Database = Postgres>,
    ) -> Result<sqlx::postgres::PgRow, sqlx::Error> {
        let sql = self.build_sql();
        sqlx::query_with(&sql, self.arguments)
            .fetch_one(executor)
            .await
    }
}

pub struct UpdateQueryBuilder<'a> {
    builder: QueryBuilder<'a, Postgres>,
    updated_fields: HashSet<&'a str>,
    has_set_fields: bool,
}

impl<'a> UpdateQueryBuilder<'a> {
    pub fn new(table: &'a str) -> Self {
        let mut builder = QueryBuilder::new("UPDATE ");
        builder.push(table);
        builder.push(" SET ");

        Self {
            builder,
            updated_fields: HashSet::new(),
            has_set_fields: false,
        }
    }

    /// Adds a field to be updated, if `None`, will not add the field
    /// To set a field to null (`None`), you need a `Some(None)`
    pub fn set<T: 'a + sqlx::Encode<'a, Postgres> + sqlx::Type<Postgres> + Send>(
        &mut self,
        column: &'a str,
        value: Option<T>,
    ) -> &mut Self {
        if !self.updated_fields.insert(column) {
            return self;
        }

        let Some(value) = value else {
            return self;
        };

        if self.has_set_fields {
            self.builder.push(", ");
        }

        self.builder.push(column);
        self.builder.push(" = ");
        self.builder.push_bind(value);

        self.has_set_fields = true;
        self
    }

    pub fn where_eq<T: 'a + sqlx::Encode<'a, Postgres> + sqlx::Type<Postgres> + Send>(
        &mut self,
        column: &'a str,
        value: T,
    ) -> &mut Self {
        self.builder.push(" WHERE ");
        self.builder.push(column);
        self.builder.push(" = ");
        self.builder.push_bind(value);
        self
    }

    pub async fn execute(
        mut self,
        executor: impl sqlx::Executor<'a, Database = Postgres>,
    ) -> Result<sqlx::postgres::PgQueryResult, sqlx::Error> {
        if !self.has_set_fields {
            return Err(sqlx::Error::Protocol(
                "No fields were set for update".into(),
            ));
        }

        let query = self.builder.build();
        query.execute(executor).await
    }
}
