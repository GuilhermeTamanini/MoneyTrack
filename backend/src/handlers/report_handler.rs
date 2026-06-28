use axum::{
    extract::{Query, State},
    http::{
        header::{CONTENT_DISPOSITION, CONTENT_TYPE},
        HeaderValue,
    },
    response::{IntoResponse, Response},
};
use serde::Deserialize;

use crate::{app_state::AppState, error::ApiError, services::report_service};

#[derive(Deserialize)]
pub struct ReportQuery {
    pub name: Option<String>,
}

pub async fn generate_report(
    State(state): State<AppState>,
    Query(params): Query<ReportQuery>,
) -> Result<Response, ApiError> {
    let csv = report_service::build_report_csv(&state.pool).await?;
    let filename = sanitize_report_name(params.name.as_deref().unwrap_or("moneytrack-report"));
    let disposition = format!("attachment; filename=\"{filename}.csv\"");

    let mut response = csv.into_response();
    response.headers_mut().insert(
        CONTENT_TYPE,
        HeaderValue::from_static("text/csv; charset=utf-8"),
    );
    response.headers_mut().insert(
        CONTENT_DISPOSITION,
        HeaderValue::from_str(&disposition).unwrap_or_else(|_| {
            HeaderValue::from_static("attachment; filename=\"moneytrack-report.csv\"")
        }),
    );

    Ok(response)
}

fn sanitize_report_name(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_') {
                ch
            } else {
                '-'
            }
        })
        .collect();

    let cleaned = cleaned.trim_matches('-').to_string();

    if cleaned.is_empty() {
        "moneytrack-report".to_string()
    } else {
        cleaned
    }
}
