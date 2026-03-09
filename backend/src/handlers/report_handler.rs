use axum::{extract::Query, http::StatusCode, Json};
use serde::Deserialize;

use crate::services::report_service;

#[derive(Deserialize)]
pub struct ReportQuery {
    pub name: String,
}

pub async fn generate_report(Query(params): Query<ReportQuery>) -> Result<StatusCode, StatusCode> {
    let path = format!("reports/{}.csv", params.name);
    std::fs::create_dir_all("reports").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    report_service::generate_report(&path).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::CREATED)
}