use std::borrow::Cow;

pub use crate::models::{
    BaseModel, ByUuid, CreatableModel, CreateListenerList, DeletableModel, DeleteListenerList,
    EventEmittingModel, Fetchable, ListenerPriority, ModelHandlerList, UpdatableModel,
    UpdateListenerList,
};

pub trait IteratorExt<R, E>: Iterator<Item = Result<R, E>> {
    fn try_collect_vec(self) -> Result<Vec<R>, E>
    where
        Self: Sized,
    {
        let mut vec = Vec::new();

        let (hint_min, hint_max) = self.size_hint();
        if let Some(hint_max) = hint_max
            && hint_min == hint_max
        {
            vec.reserve_exact(hint_max);
        }

        for item in self {
            vec.push(item?);
        }

        Ok(vec)
    }
}

impl<R, E, T: Iterator<Item = Result<R, E>>> IteratorExt<R, E> for T {}

pub trait OptionExt<T> {
    fn try_map<R, E, F: FnMut(T) -> Result<R, E>>(self, f: F) -> Result<Option<R>, E>;
}

impl<T> OptionExt<T> for Option<T> {
    #[inline]
    fn try_map<R, E, F: FnMut(T) -> Result<R, E>>(self, mut f: F) -> Result<Option<R>, E> {
        match self {
            Some(item) => Ok(Some(f(item)?)),
            None => Ok(None),
        }
    }
}

#[async_trait::async_trait]
pub trait AsyncOptionExt<T, Fut: Future<Output = T>> {
    async fn awaited(self) -> Option<T>;
}

#[async_trait::async_trait]
impl<T, Fut: Future<Output = T> + Send> AsyncOptionExt<T, Fut> for Option<Fut> {
    #[inline]
    async fn awaited(self) -> Option<T> {
        match self {
            Some(item) => Some(item.await),
            None => None,
        }
    }
}

pub trait SqlxErrorExt {
    fn is_unique_violation(&self) -> bool;
    fn is_foreign_key_violation(&self) -> bool;
    fn is_check_violation(&self) -> bool;

    fn code(&self) -> Option<Cow<'_, str>>;
    fn message(&self) -> Option<&str>;
}

impl SqlxErrorExt for sqlx::Error {
    #[inline]
    fn is_unique_violation(&self) -> bool {
        self.as_database_error()
            .is_some_and(|e| e.is_unique_violation())
    }

    #[inline]
    fn is_foreign_key_violation(&self) -> bool {
        self.as_database_error()
            .is_some_and(|e| e.is_foreign_key_violation())
    }

    #[inline]
    fn is_check_violation(&self) -> bool {
        self.as_database_error()
            .is_some_and(|e| e.is_check_violation())
    }

    #[inline]
    fn code(&self) -> Option<Cow<'_, str>> {
        self.as_database_error().and_then(|e| e.code())
    }

    #[inline]
    fn message(&self) -> Option<&str> {
        self.as_database_error().map(|e| e.message())
    }
}

pub trait StringExt: Sized {
    /// Returns Some if the string has content, otherwise None.
    fn optional(&self) -> Option<&Self>;

    /// Returns Some if the string has content, otherwise None.
    fn into_optional(self) -> Option<Self>;
}

impl StringExt for String {
    #[inline]
    fn optional(&self) -> Option<&Self> {
        if self.is_empty() { None } else { Some(self) }
    }

    #[inline]
    fn into_optional(self) -> Option<Self> {
        if self.is_empty() { None } else { Some(self) }
    }
}

impl StringExt for compact_str::CompactString {
    #[inline]
    fn optional(&self) -> Option<&Self> {
        if self.is_empty() { None } else { Some(self) }
    }

    #[inline]
    fn into_optional(self) -> Option<Self> {
        if self.is_empty() { None } else { Some(self) }
    }
}

impl StringExt for &str {
    #[inline]
    fn optional(&self) -> Option<&Self> {
        if self.is_empty() { None } else { Some(self) }
    }

    #[inline]
    fn into_optional(self) -> Option<Self> {
        if self.is_empty() { None } else { Some(self) }
    }
}
