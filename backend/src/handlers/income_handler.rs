use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::app_state::AppState;
use crate::error::ApiError;
use crate::models::income::{Income, NewIncome};
use crate::services::income_service;

pub async fn get_incomes(State(state): State<AppState>) -> Result<Json<Vec<Income>>, ApiError> {
    let incomes = income_service::list_incomes(&state.pool).await?;
    Ok(Json(incomes))
}

pub async fn create_income(
    State(state): State<AppState>,
    Json(payload): Json<NewIncome>,
) -> Result<(StatusCode, Json<Income>), ApiError> {
    let created = income_service::add_income(&state.pool, payload).await?;
    Ok((StatusCode::CREATED, Json(created)))
}

pub async fn delete_income(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<StatusCode, ApiError> {
    let deleted = income_service::remove_income(&state.pool, id).await?;
    if deleted {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
