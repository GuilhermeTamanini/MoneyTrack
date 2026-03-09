use sqlx::PgPool;

use crate::models::income::{Income, NewIncome};
use crate::repositories::income_repository;

pub async fn list_incomes(pool: &PgPool) -> Result<Vec<Income>, sqlx::Error> {
    income_repository::get_incomes(pool).await
}

pub async fn add_income(pool: &PgPool, payload: NewIncome) -> Result<Income, sqlx::Error> {
    income_repository::create_income(pool, payload).await
}
