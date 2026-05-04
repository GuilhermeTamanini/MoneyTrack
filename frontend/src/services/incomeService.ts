import type { Income, NewIncome } from '@/types/income';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function getIncomes(): Promise<Income[]> {
  const response = await fetch(`${API_BASE_URL}/incomes`);
  if (!response.ok) throw new Error('Erro ao buscar receitas');
  return response.json();
}

export async function createIncome(data: NewIncome): Promise<Income> {
  const response = await fetch(`${API_BASE_URL}/incomes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao criar receita');
  return response.json();
}
