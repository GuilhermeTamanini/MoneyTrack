mod app_state;
mod db;
mod error;
mod handlers;
mod models;
mod repositories;
mod routes;
mod services;

use axum::Router;
use axum::http::Method;
use sqlx::postgres::PgPoolOptions;
use std::env;
use tower_http::cors::{Any, CorsLayer};

use app_state::AppState;
use db::init_db;
use routes::category_routes::category_routes;
use routes::expense_routes::expense_routes;
use routes::income_routes::income_routes;

#[tokio::main]
async fn main() {
    // TODO needs to change to get from .env file
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgres://postgres:postgres@localhost:5432/moneytrack".to_string()
    });

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to PostgresSQL");

    init_db(&pool).await.expect("Failed to initialize tables");

    let state = AppState { pool };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .merge(category_routes())
        .merge(expense_routes())
        .merge(income_routes())
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    println!("Server running on http://localhost:3000");

    axum::serve(listener, app).await.unwrap();
}
