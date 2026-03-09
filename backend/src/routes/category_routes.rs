use axum::{routing::get, Router};

use crate::app_state::AppState;
use crate::handlers::category_handler;

pub fn category_routes() -> Router<AppState> {
    Router::new().route(
        "/categories",
        get(category_handler::get_categories).post(category_handler::create_category),
    )
}
