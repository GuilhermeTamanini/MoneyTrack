use crate::app_state::AppState;
use crate::handlers::report_handler;
use axum::{Router, routing::get};

pub fn report_routes() -> Router<AppState> {
    Router::new().route("/report", get(report_handler::generate_report))
}
