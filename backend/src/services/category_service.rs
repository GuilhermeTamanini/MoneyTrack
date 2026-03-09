use sqlx::PgPool;

use crate::models::category::{Category, NewCategory};
use crate::repositories::category_repository;

pub async fn list_categories(pool: &PgPool) -> Result<Vec<Category>, sqlx::Error> {
    category_repository::get_categories(pool).await
}

pub async fn add_category(pool: &PgPool, payload: NewCategory) -> Result<Category, sqlx::Error> {
    category_repository::create_category(pool, payload).await
}
