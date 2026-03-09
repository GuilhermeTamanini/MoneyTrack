use axum::{extract::State, http::StatusCode, Json};

use crate::app_state::AppState;
use crate::error::ApiError;
use crate::models::expense::{Expense, NewExpense};
use crate::services::expense_service;

pub async fn get_expenses(State(state): State<AppState>) -> Result<Json<Vec<Expense>>, ApiError> {
    let expenses = expense_service::list_expenses(&state.pool).await?;
    Ok(Json(expenses))
}

pub async fn create_expense(
    State(state): State<AppState>,
    Json(payload): Json<NewExpense>,
) -> Result<(StatusCode, Json<Expense>), ApiError> {
    let created = expense_service::add_expense(&state.pool, payload).await?;
    Ok((StatusCode::CREATED, Json(created)))
}
