use axum::{routing::get, Router};
use crate::app_state::AppState;
use crate::handlers::report_handler;

pub fn expense_routes() -> Router<AppState> {
    Router::new().route(
        "/report",
        get(report_handler::generate_report)
    )
}
