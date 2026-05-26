use crate::app_state::AppState;
use crate::handlers::expense_handler;
use axum::{Router, routing::get};

pub fn expense_routes() -> Router<AppState> {
    Router::new()
        .route(
            "/expenses",
            get(expense_handler::get_expenses).post(expense_handler::create_expense),
        )
        .route(
            "/expenses/:id",
            axum::routing::delete(expense_handler::delete_expense),
        )
}
