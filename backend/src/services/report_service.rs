use std::fs::File;
use std::io::Result;

pub async fn generate_report(path: &str) -> Result<()> {
    let _file = std::fs::File::create(path)?;

    Ok(())
}