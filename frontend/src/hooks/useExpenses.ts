import { useState, useEffect, useCallback } from 'react';
import type { Expense, NewExpense } from '@/types/expense';
import { getExpenses, createExpense } from '@/services/expenseService';

interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submitError: string | null;
  addExpense: (data: NewExpense) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = useCallback(async (data: NewExpense): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const created = await createExpense(data);
      setExpenses(prev => [created, ...prev]);
      return true;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao criar despesa');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { expenses, isLoading, isSubmitting, error, submitError, addExpense, refetch: fetchExpenses };
}
