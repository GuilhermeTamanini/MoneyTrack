use sqlx::PgPool;

use crate::models::expense::{Expense, NewExpense};
use crate::repositories::expense_repository;

pub async fn list_expenses(pool: &PgPool) -> Result<Vec<Expense>, sqlx::Error> {
    expense_repository::get_expenses(pool).await
}

pub async fn add_expense(pool: &PgPool, payload: NewExpense) -> Result<Expense, sqlx::Error> {
    expense_repository::create_expense(pool, payload).await
}
