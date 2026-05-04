import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useIncomes } from '@/hooks/useIncomes';
import type { NewIncome } from '@/types/income';
import type { Income } from '@/types/income';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Form ──────────────────────────────────────────────────────────────────────

function IncomeForm({
  onSubmit,
  isSubmitting,
  submitError,
}: {
  onSubmit: (data: NewIncome) => Promise<boolean>;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const ok = await onSubmit({ description: description.trim(), amount: parsedAmount });
    if (ok) {
      setDescription('');
      setAmount('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  const isValid = description.trim() !== '' && parseFloat(amount.replace(',', '.')) > 0;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
      <h2 className="mb-5 text-lg font-semibold text-slate-800">Nova Receita</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1.5">
          <label htmlFor="inc-description" className="text-sm font-medium text-slate-700">
            Descrição <span className="text-red-500">*</span>
          </label>
          <input
            id="inc-description"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Salário, Freelance..."
            required
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="inc-amount" className="text-sm font-medium text-slate-700">
            Valor (R$) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">
              R$
            </span>
            <input
              id="inc-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              required
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
            />
          </div>
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</p>
        )}
        {success && (
          <p className="rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-700">
            ✓ Receita cadastrada com sucesso!
          </p>
        )}

        <Button type="submit" disabled={isSubmitting || !isValid} className="self-start">
          {isSubmitting ? 'Salvando...' : 'Salvar Receita'}
        </Button>
      </form>
    </div>
  );
}

// ─── List ──────────────────────────────────────────────────────────────────────

function IncomeList({
  incomes,
  isLoading,
  error,
  onRetry,
}: {
  incomes: Income[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const total = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">Receitas</h2>
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
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Receitas</h2>
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
        <h2 className="text-lg font-semibold text-slate-800">Receitas</h2>
        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
          {incomes.length} {incomes.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {incomes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="text-3xl">💰</span>
          <p className="text-sm text-slate-500">Nenhuma receita cadastrada ainda.</p>
          <p className="text-xs text-slate-400">Use o formulário ao lado para adicionar.</p>
        </div>
      ) : (
        <>
          {/* Total */}
          <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
            <p className="text-xs font-medium text-brand-600">Total cadastrado</p>
            <p className="text-xl font-semibold text-brand-800">{formatCurrency(total)}</p>
          </div>

          <ul className="flex flex-col gap-2">
            {incomes.map(inc => (
              <li
                key={inc.id}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-sm">
                  💵
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{inc.description}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-brand-700">
                  {formatCurrency(inc.amount)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IncomesPage() {
  const { incomes, isLoading, isSubmitting, error, submitError, addIncome, refetch } = useIncomes();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(176,222,200,0.4),_transparent_35%),linear-gradient(180deg,_#f8fcfa_0%,_#eef6f1_100%)] px-6 py-16 text-slate-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur md:p-12">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
            MoneyTrack
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Receitas
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Registre todas as suas entradas financeiras.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <IncomeForm onSubmit={addIncome} isSubmitting={isSubmitting} submitError={submitError} />
          <IncomeList incomes={incomes} isLoading={isLoading} error={error} onRetry={refetch} />
        </div>
      </section>
    </main>
  );
}
