import { useState, useEffect, useCallback } from 'react';
import type { Category, NewCategory } from '@/types/category';
import { getCategories, createCategory, deleteCategory } from '@/services/categoryService';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  isSubmitting: boolean;
  deletingId: number | null;
  error: string | null;
  submitError: string | null;
  addCategory: (data: NewCategory) => Promise<boolean>;
  removeCategory: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (data: NewCategory): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const created = await createCategory(data);
      setCategories(prev => [...prev, created]);
      return true;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao criar categoria');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const removeCategory = useCallback(async (id: number): Promise<void> => {
    try {
      setDeletingId(id);
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    categories,
    isLoading,
    isSubmitting,
    deletingId,
    error,
    submitError,
    addCategory,
    removeCategory,
    refetch: fetchCategories,
  };
}
