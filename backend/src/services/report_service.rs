use std::cmp::Ordering;
use std::collections::BTreeMap;

use sqlx::PgPool;

use crate::models::{expense::Expense, income::Income};
use crate::services::{category_service, expense_service, income_service};

pub struct ReportSnapshot {
    pub category_count: usize,
    pub income_count: usize,
    pub expense_count: usize,
    pub total_income: f64,
    pub total_expense: f64,
    pub balance: f64,
    pub category_breakdown: Vec<CategoryBreakdown>,
    pub recent_incomes: Vec<Income>,
    pub recent_expenses: Vec<Expense>,
}

pub struct CategoryBreakdown {
    pub category_id: Option<i64>,
    pub category_name: String,
    pub total: f64,
    pub count: usize,
}

pub async fn build_report_snapshot(pool: &PgPool) -> Result<ReportSnapshot, sqlx::Error> {
    let (categories, mut incomes, mut expenses) = tokio::try_join!(
        category_service::list_categories(pool),
        income_service::list_incomes(pool),
        expense_service::list_expenses(pool),
    )?;

    let income_count = incomes.len();
    let expense_count = expenses.len();
    let total_income = incomes.iter().map(|income| income.amount).sum::<f64>();
    let total_expense = expenses.iter().map(|expense| expense.amount).sum::<f64>();
    let balance = total_income - total_expense;

    let mut category_totals: BTreeMap<(Option<i64>, String), (f64, usize)> = BTreeMap::new();
    for expense in &expenses {
        let category_name = expense
            .category_name
            .clone()
            .unwrap_or_else(|| "Sem categoria".to_string());
        let key = (expense.category_id, category_name);
        let entry = category_totals.entry(key).or_insert((0.0, 0));
        entry.0 += expense.amount;
        entry.1 += 1;
    }

    let mut category_breakdown = category_totals
        .into_iter()
        .map(|((category_id, category_name), (total, count))| CategoryBreakdown {
            category_id,
            category_name,
            total,
            count,
        })
        .collect::<Vec<_>>();

    category_breakdown.sort_by(|left, right| {
        right
            .total
            .partial_cmp(&left.total)
            .unwrap_or(Ordering::Equal)
            .then_with(|| left.category_name.cmp(&right.category_name))
    });

    incomes.sort_by(|left, right| right.id.cmp(&left.id));
    incomes.truncate(5);

    expenses.sort_by(|left, right| right.id.cmp(&left.id));
    expenses.truncate(5);

    Ok(ReportSnapshot {
        category_count: categories.len(),
        income_count,
        expense_count,
        total_income,
        total_expense,
        balance,
        category_breakdown,
        recent_incomes: incomes,
        recent_expenses: expenses,
    })
}

pub async fn build_report_csv(pool: &PgPool) -> Result<String, sqlx::Error> {
    let snapshot = build_report_snapshot(pool).await?;
    Ok(render_report_csv(&snapshot))
}

pub fn render_report_csv(report: &ReportSnapshot) -> String {
    let mut output = String::new();

    push_csv_row(
        &mut output,
        &[
            "section".to_string(),
            "label".to_string(),
            "value".to_string(),
            "details".to_string(),
        ],
    );

    push_csv_row(
        &mut output,
        &[
            "summary".to_string(),
            "Total receitas".to_string(),
            format_money(report.total_income),
            format!("{} itens", report.income_count),
        ],
    );
    push_csv_row(
        &mut output,
        &[
            "summary".to_string(),
            "Total despesas".to_string(),
            format_money(report.total_expense),
            format!("{} itens", report.expense_count),
        ],
    );
    push_csv_row(
        &mut output,
        &[
            "summary".to_string(),
            "Saldo".to_string(),
            format_money(report.balance),
            String::new(),
        ],
    );
    push_csv_row(
        &mut output,
        &[
            "summary".to_string(),
            "Categorias".to_string(),
            report.category_count.to_string(),
            String::new(),
        ],
    );

    for category in &report.category_breakdown {
        let details = match category.category_id {
            Some(id) => format!("id {}", id),
            None => "sem categoria".to_string(),
        };
        push_csv_row(
            &mut output,
            &[
                "category".to_string(),
                category.category_name.clone(),
                format_money(category.total),
                format!("{} | {}", category.count, details),
            ],
        );
    }

    for income in &report.recent_incomes {
        push_csv_row(
            &mut output,
            &[
                "income".to_string(),
                income.description.clone(),
                format_money(income.amount),
                format!("id {}", income.id),
            ],
        );
    }

    for expense in &report.recent_expenses {
        let category_name = expense
            .category_name
            .as_deref()
            .unwrap_or("Sem categoria")
            .to_string();
        push_csv_row(
            &mut output,
            &[
                "expense".to_string(),
                expense.description.clone(),
                format_money(expense.amount),
                category_name,
            ],
        );
    }

    output
}

fn format_money(value: f64) -> String {
    format!("{value:.2}")
}

fn push_csv_row(output: &mut String, fields: &[String]) {
    for (index, field) in fields.iter().enumerate() {
        if index > 0 {
            output.push(',');
        }
        output.push_str(&escape_csv(field));
    }
    output.push('\n');
}

fn escape_csv(value: &str) -> String {
    if value.contains([',', '"', '\n', '\r']) {
        format!("\"{}\"", value.replace('"', "\"\""))
    } else {
        value.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn csv_includes_summary_rows() {
        let report = ReportSnapshot {
            category_count: 2,
            income_count: 3,
            expense_count: 4,
            total_income: 1500.0,
            total_expense: 900.0,
            balance: 600.0,
            category_breakdown: vec![CategoryBreakdown {
                category_id: Some(1),
                category_name: "Alimentacao".to_string(),
                total: 450.0,
                count: 2,
            }],
            recent_incomes: vec![],
            recent_expenses: vec![],
        };

        let csv = render_report_csv(&report);

        assert!(csv.contains("summary,Total receitas,1500.00,3 itens"));
        assert!(csv.contains("category,Alimentacao,450.00,2 | id 1"));
    }
}
