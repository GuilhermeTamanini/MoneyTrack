import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useExpenses } from '@/hooks/useExpenses';
import type { Category } from '@/types/category';
import type { NewExpense, Expense } from '@/types/expense';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ExpenseForm({
  categories,
  isCategoriesLoading,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  categories: Category[];
  isCategoriesLoading: boolean;
  onSubmit: (data: NewExpense) => Promise<boolean>;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    const parsedCategoryId = Number(categoryId);

    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !parsedCategoryId) {
      return;
    }

    const ok = await onSubmit({
      description: description.trim(),
      amount: parsedAmount,
      category_id: parsedCategoryId,
    });

    if (ok) {
      setDescription('');
      setAmount('');
      setCategoryId('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  const isValid =
    description.trim() !== '' &&
    parseFloat(amount.replace(',', '.')) > 0 &&
    Number(categoryId) > 0;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
      <h2 className="mb-5 text-lg font-semibold text-slate-800">Nova Despesa</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="exp-description" className="text-sm font-medium text-slate-700">
            Descricao <span className="text-red-500">*</span>
          </label>
          <input
            id="exp-description"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Aluguel, Mercado..."
            required
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="exp-category" className="text-sm font-medium text-slate-700">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            id="exp-category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
            disabled={isSubmitting || isCategoriesLoading || categories.length === 0}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
          >
            <option value="">
              {isCategoriesLoading ? 'Carregando categorias...' : 'Selecione uma categoria'}
            </option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {!isCategoriesLoading && categories.length === 0 && (
            <p className="text-xs text-red-500">Cadastre uma categoria antes de criar despesas.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="exp-amount" className="text-sm font-medium text-slate-700">
            Valor (R$) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">
              R$
            </span>
            <input
              id="exp-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              required
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
            />
          </div>
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</p>
        )}
        {success && (
          <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            Despesa cadastrada com sucesso.
          </p>
        )}

        <Button type="submit" disabled={isSubmitting || !isValid} className="self-start">
          {isSubmitting ? 'Salvando...' : 'Salvar Despesa'}
        </Button>
      </form>
    </div>
  );
}

function ExpenseList({
  expenses,
  isLoading,
  error,
  deletingId,
  onRetry,
  onDelete,
}: {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  deletingId: number | null;
  onRetry: () => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  async function handleConfirm(id: number) {
    setConfirmId(null);
    await onDelete(id);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">Despesas</h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Despesas</h2>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="secondary" onClick={onRetry}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Despesas</h2>
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
          {expenses.length} {expenses.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-sm text-slate-500">Nenhuma despesa cadastrada ainda.</p>
          <p className="text-xs text-slate-400">Use o formulario ao lado para adicionar.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
            <p className="text-xs font-medium text-red-500">Total em despesas</p>
            <p className="text-xl font-semibold text-red-700">{formatCurrency(total)}</p>
          </div>

          <ul className="flex flex-col gap-2">
            {expenses.map(exp => (
              <li
                key={exp.id}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:border-red-200 hover:bg-red-50/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{exp.description}</p>
                  <p className="truncate text-xs text-slate-500">
                    {exp.category_name ?? 'Sem categoria'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-red-600">
                  {formatCurrency(exp.amount)}
                </span>
                {confirmId === exp.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-500">Confirmar?</span>
                    <button
                      onClick={() => handleConfirm(exp.id)}
                      disabled={deletingId === exp.id}
                      className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      Nao
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(exp.id)}
                    disabled={deletingId === exp.id}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingId === exp.id ? '...' : 'Excluir'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const {
    expenses,
    isLoading,
    isSubmitting,
    deletingId,
    error,
    submitError,
    addExpense,
    removeExpense,
    refetch,
  } = useExpenses();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(176,222,200,0.4),_transparent_35%),linear-gradient(180deg,_#f8fcfa_0%,_#eef6f1_100%)] px-6 py-16 text-slate-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur md:p-12">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
            MoneyTrack
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Despesas
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Registre e acompanhe todas as suas saidas financeiras por categoria.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ExpenseForm
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            onSubmit={addExpense}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            error={error}
            deletingId={deletingId}
            onRetry={refetch}
            onDelete={removeExpense}
          />
        </div>
      </section>
    </main>
  );
}
