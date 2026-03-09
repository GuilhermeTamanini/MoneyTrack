use sqlx::PgPool;

use crate::models::expense::{Expense, NewExpense};

pub async fn get_expenses(pool: &PgPool) -> Result<Vec<Expense>, sqlx::Error> {
    sqlx::query_as::<_, Expense>("SELECT id, description, amount FROM expenses ORDER BY id")
        .fetch_all(pool)
        .await
}

pub async fn create_expense(pool: &PgPool, payload: NewExpense) -> Result<Expense, sqlx::Error> {
    sqlx::query_as::<_, Expense>(
        "INSERT INTO expenses (description, amount) VALUES ($1, $2) RETURNING id, description, amount",
    )
    .bind(payload.description)
    .bind(payload.amount)
    .fetch_one(pool)
    .await
}
