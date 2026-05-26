use sqlx::PgPool;

use crate::models::category::{Category, NewCategory};

pub async fn get_categories(pool: &PgPool) -> Result<Vec<Category>, sqlx::Error> {
    sqlx::query_as::<_, Category>("SELECT id, name FROM categories ORDER BY id")
        .fetch_all(pool)
        .await
}

pub async fn create_category(pool: &PgPool, payload: NewCategory) -> Result<Category, sqlx::Error> {
    sqlx::query_as::<_, Category>("INSERT INTO categories (name) VALUES ($1) RETURNING id, name")
        .bind(payload.name)
        .fetch_one(pool)
        .await
}

pub async fn delete_category(pool: &PgPool, id: i64) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM categories WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(result.rows_affected() > 0)
}
