import { useState, useEffect, useCallback } from 'react';
import type { Income, NewIncome } from '@/types/income';
import { getIncomes, createIncome, deleteIncome } from '@/services/incomeService';

interface UseIncomesReturn {
  incomes: Income[];
  isLoading: boolean;
  isSubmitting: boolean;
  deletingId: number | null;
  error: string | null;
  submitError: string | null;
  addIncome: (data: NewIncome) => Promise<boolean>;
  removeIncome: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useIncomes(): UseIncomesReturn {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchIncomes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getIncomes();
      setIncomes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const addIncome = useCallback(async (data: NewIncome): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const created = await createIncome(data);
      setIncomes(prev => [created, ...prev]);
      return true;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao criar receita');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const removeIncome = useCallback(async (id: number): Promise<void> => {
    try {
      setDeletingId(id);
      await deleteIncome(id);
      setIncomes(prev => prev.filter(inc => inc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir receita');
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    incomes,
    isLoading,
    isSubmitting,
    deletingId,
    error,
    submitError,
    addIncome,
    removeIncome,
    refetch: fetchIncomes,
  };
}
