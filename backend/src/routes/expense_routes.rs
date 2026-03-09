use axum::{routing::get, Router};
use crate::app_state::AppState;
use crate::handlers::expense_handler;

pub fn expense_routes() -> Router<AppState> {
    Router::new().route(
        "/expenses",
        get(expense_handler::get_expenses).post(expense_handler::create_expense),
    )
}
