import { useState, useEffect, useCallback } from 'react';
import type { Expense, NewExpense } from '@/types/expense';
import { getExpenses, createExpense, deleteExpense } from '@/services/expenseService';

interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  isSubmitting: boolean;
  deletingId: number | null;
  error: string | null;
  submitError: string | null;
  addExpense: (data: NewExpense) => Promise<boolean>;
  removeExpense: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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

  const removeExpense = useCallback(async (id: number): Promise<void> => {
    try {
      setDeletingId(id);
      await deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir despesa');
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    expenses,
    isLoading,
    isSubmitting,
    deletingId,
    error,
    submitError,
    addExpense,
    removeExpense,
    refetch: fetchExpenses,
  };
}
