use sqlx::PgPool;

use crate::models::expense::{Expense, NewExpense};

pub async fn get_expenses(pool: &PgPool) -> Result<Vec<Expense>, sqlx::Error> {
    sqlx::query_as::<_, Expense>(
        r#"
        SELECT
            expenses.id,
            expenses.description,
            expenses.amount,
            expenses.category_id,
            categories.name AS category_name
        FROM expenses
        LEFT JOIN categories ON categories.id = expenses.category_id
        ORDER BY expenses.id
        "#,
    )
    .fetch_all(pool)
    .await
}

pub async fn create_expense(pool: &PgPool, payload: NewExpense) -> Result<Expense, sqlx::Error> {
    sqlx::query_as::<_, Expense>(
        r#"
        INSERT INTO expenses (description, amount, category_id)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            description,
            amount,
            category_id,
            (SELECT name FROM categories WHERE id = $3) AS category_name
        "#,
    )
    .bind(payload.description)
    .bind(payload.amount)
    .bind(payload.category_id)
    .fetch_one(pool)
    .await
}

pub async fn delete_expense(pool: &PgPool, id: i64) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM expenses WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(result.rows_affected() > 0)
}
