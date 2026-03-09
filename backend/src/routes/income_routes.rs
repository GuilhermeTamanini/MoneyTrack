use axum::{routing::get, Router};

use crate::app_state::AppState;
use crate::handlers::income_handler;

pub fn income_routes() -> Router<AppState> {
    Router::new().route(
        "/incomes",
        get(income_handler::get_incomes).post(income_handler::create_income),
    )
}
