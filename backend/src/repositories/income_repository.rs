use sqlx::PgPool;

use crate::models::income::{Income, NewIncome};

pub async fn get_incomes(pool: &PgPool) -> Result<Vec<Income>, sqlx::Error> {
    sqlx::query_as::<_, Income>("SELECT id, description, amount FROM incomes ORDER BY id")
        .fetch_all(pool)
        .await
}

pub async fn create_income(pool: &PgPool, payload: NewIncome) -> Result<Income, sqlx::Error> {
    sqlx::query_as::<_, Income>(
        "INSERT INTO incomes (description, amount) VALUES ($1, $2) RETURNING id, description, amount",
    )
    .bind(payload.description)
    .bind(payload.amount)
    .fetch_one(pool)
    .await
}

pub async fn delete_income(pool: &PgPool, id: i64) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM incomes WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(result.rows_affected() > 0)
}
