use axum::{Router, routing::get};

use crate::app_state::AppState;
use crate::handlers::income_handler;

pub fn income_routes() -> Router<AppState> {
    Router::new()
        .route(
            "/incomes",
            get(income_handler::get_incomes).post(income_handler::create_income),
        )
        .route(
            "/incomes/:id",
            axum::routing::delete(income_handler::delete_income),
        )
}
