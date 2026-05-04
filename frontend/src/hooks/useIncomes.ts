import { useState, useEffect, useCallback } from 'react';
import type { Income, NewIncome } from '@/types/income';
import { getIncomes, createIncome } from '@/services/incomeService';

interface UseIncomesReturn {
  incomes: Income[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submitError: string | null;
  addIncome: (data: NewIncome) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useIncomes(): UseIncomesReturn {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return { incomes, isLoading, isSubmitting, error, submitError, addIncome, refetch: fetchIncomes };
}
