use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, FromRow)]
pub struct Income {
    pub id: i64,
    pub description: String,
    pub amount: f64,
}

#[derive(Deserialize)]
pub struct NewIncome {
    pub description: String,
    pub amount: f64,
}
