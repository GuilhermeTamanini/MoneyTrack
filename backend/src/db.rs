use sqlx::PgPool;

pub async fn init_db(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS categories (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL
        );
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS incomes (
            id BIGSERIAL PRIMARY KEY,
            description TEXT NOT NULL,
            amount DOUBLE PRECISION NOT NULL
        );
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS expenses (
            id BIGSERIAL PRIMARY KEY,
            description TEXT NOT NULL,
            amount DOUBLE PRECISION NOT NULL
        );
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}
