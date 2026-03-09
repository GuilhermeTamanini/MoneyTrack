use axum::{extract::State, http::StatusCode, Json};

use crate::app_state::AppState;
use crate::error::ApiError;
use crate::models::category::{Category, NewCategory};
use crate::services::category_service;

pub async fn get_categories(State(state): State<AppState>) -> Result<Json<Vec<Category>>, ApiError> {
    let categories = category_service::list_categories(&state.pool).await?;
    Ok(Json(categories))
}

pub async fn create_category(
    State(state): State<AppState>,
    Json(payload): Json<NewCategory>,
) -> Result<(StatusCode, Json<Category>), ApiError> {
    let created = category_service::add_category(&state.pool, payload).await?;
    Ok((StatusCode::CREATED, Json(created)))
}
