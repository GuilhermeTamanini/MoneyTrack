import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import type { NewCategory } from '@/types/category';

// ─── Form ──────────────────────────────────────────────────────────────────────

export function CategoryForm({
  onSubmit,
  isSubmitting,
  submitError,
}: {
  onSubmit: (data: NewCategory) => Promise<boolean>;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await onSubmit({ name: name.trim() });
    if (ok) {
      setName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
      <h2 className="mb-5 text-lg font-semibold text-slate-800">Nova Categoria</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cat-name" className="text-sm font-medium text-slate-700">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Alimentação"
            required
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
          />
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</p>
        )}
        {success && (
          <p className="rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-700">
            ✓ Categoria criada com sucesso!
          </p>
        )}

        <Button type="submit" disabled={isSubmitting || !name.trim()} className="self-start">
          {isSubmitting ? 'Salvando...' : 'Salvar Categoria'}
        </Button>
      </form>
    </div>
  );
}

// ─── List ──────────────────────────────────────────────────────────────────────

export function CategoryList({
  categories,
  isLoading,
  error,
  deletingId,
  onRetry,
  onDelete,
}: {
  categories: { id: number; name: string }[];
  isLoading: boolean;
  error: string | null;
  deletingId: number | null;
  onRetry: () => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  function handleDeleteClick(id: number) {
    setConfirmId(id);
  }

  async function handleConfirm(id: number) {
    setConfirmId(null);
    await onDelete(id);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">Categorias</h2>
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
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Categorias</h2>
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
        <h2 className="text-lg font-semibold text-slate-800">Categorias</h2>
        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
          {categories.length} {categories.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="text-3xl">🗂️</span>
          <p className="text-sm text-slate-500">Nenhuma categoria cadastrada ainda.</p>
          <p className="text-xs text-slate-400">Use o formulário ao lado para adicionar.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map(cat => (
            <li
              key={cat.id}
              className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-sm font-bold">
                {cat.name.charAt(0).toUpperCase()}
              </div>

              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                {cat.name}
              </p>

              {confirmId === cat.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-slate-500">Confirmar?</span>
                  <button
                    onClick={() => handleConfirm(cat.id)}
                    disabled={deletingId === cat.id}
                    className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleDeleteClick(cat.id)}
                  disabled={deletingId === cat.id}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
                  title="Excluir categoria"
                >
                  {deletingId === cat.id ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    isSubmitting,
    deletingId,
    error,
    submitError,
    addCategory,
    removeCategory,
    refetch,
  } = useCategories();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(176,222,200,0.4),_transparent_35%),linear-gradient(180deg,_#f8fcfa_0%,_#eef6f1_100%)] px-6 py-16 text-slate-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur md:p-12">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
            MoneyTrack
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Categorias
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Organize suas receitas e despesas em categorias personalizadas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <CategoryForm onSubmit={addCategory} isSubmitting={isSubmitting} submitError={submitError} />
          <CategoryList
            categories={categories}
            isLoading={isLoading}
            error={error}
            deletingId={deletingId}
            onRetry={refetch}
            onDelete={removeCategory}
          />
        </div>
      </section>
    </main>
  );
}
