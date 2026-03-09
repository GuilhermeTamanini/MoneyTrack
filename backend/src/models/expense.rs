use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, FromRow)]
pub struct Expense {
    pub id: i64,
    pub description: String,
    pub amount: f64,
}

#[derive(Deserialize)]
pub struct NewExpense {
    pub description: String,
    pub amount: f64,
}
