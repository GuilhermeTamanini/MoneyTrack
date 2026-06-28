const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function downloadReportCsv(name = 'moneytrack-report'): Promise<void> {
  const safeName = sanitizeFileName(name);
  const response = await fetch(
    `${API_BASE_URL}/report?name=${encodeURIComponent(safeName)}`,
  );

  if (!response.ok) {
    throw new Error('Erro ao gerar relatorio');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `${safeName}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'moneytrack-report';
}
