use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, FromRow)]
pub struct Category {
    pub id: i64,
    pub name: String,
}

#[derive(Deserialize)]
pub struct NewCategory {
    pub name: String,
}
