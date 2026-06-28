import { useMemo, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { CategoryForm, CategoryList } from '@/pages/CategoriesPage';
import { ExpenseForm, ExpenseList } from '@/pages/ExpensesPage';
import { IncomeForm, IncomeList } from '@/pages/IncomesPage';
import { useCategories } from '@/hooks/useCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import { downloadReportCsv } from '@/services/reportService';
import type { Expense } from '@/types/expense';

type Tone = 'brand' | 'rose' | 'amber' | 'slate';

type BreakdownItem = {
  categoryId: number | null;
  categoryName: string;
  total: number;
  count: number;
  share: number;
};

const sectionLinks = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'relatorio', label: 'Relatorio' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'despesas', label: 'Despesas' },
  { id: 'receitas', label: 'Receitas' },
] as const;

const toneStyles: Record<Tone, string> = {
  brand: 'border-brand-200 bg-brand-50/70 text-brand-800',
  rose: 'border-rose-200 bg-rose-50/70 text-rose-800',
  amber: 'border-amber-200 bg-amber-50/70 text-amber-800',
  slate: 'border-slate-200 bg-slate-50/70 text-slate-800',
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
}) {
  return (
    <article className={`rounded-2xl border p-5 shadow-soft ${toneStyles[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  );
}

function TransactionLine({
  title,
  amount,
  note,
  tone,
}: {
  title: string;
  amount: number;
  note: string;
  tone: 'brand' | 'rose';
}) {
  const amountClass = tone === 'brand' ? 'text-brand-700' : 'text-rose-700';
  const badgeClass = tone === 'brand' ? 'bg-brand-100 text-brand-700' : 'bg-rose-100 text-rose-700';

  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${badgeClass}`}>
        {title.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
        <p className="truncate text-xs text-slate-500">{note}</p>
      </div>
      <span className={`shrink-0 text-sm font-semibold ${amountClass}`}>{formatCurrency(amount)}</span>
    </li>
  );
}

function DashboardPage() {
  const {
    categories,
    isLoading: isCategoriesLoading,
    isSubmitting: isCategoriesSubmitting,
    deletingId: deletingCategoryId,
    error: categoriesError,
    submitError: categorySubmitError,
    addCategory,
    removeCategory,
    refetch: refetchCategories,
  } = useCategories();
  const {
    expenses,
    isLoading: isExpensesLoading,
    isSubmitting: isExpensesSubmitting,
    deletingId: deletingExpenseId,
    error: expensesError,
    submitError: expenseSubmitError,
    addExpense,
    removeExpense,
    refetch: refetchExpenses,
  } = useExpenses();
  const {
    incomes,
    isLoading: isIncomesLoading,
    isSubmitting: isIncomesSubmitting,
    deletingId: deletingIncomeId,
    error: incomesError,
    submitError: incomeSubmitError,
    addIncome,
    removeIncome,
    refetch: refetchIncomes,
  } = useIncomes();

  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, income) => sum + income.amount, 0),
    [incomes],
  );
  const totalExpense = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );
  const balance = totalIncome - totalExpense;

  const expenseBreakdown = useMemo<BreakdownItem[]>(() => {
    const totals = new Map<string, BreakdownItem>();

    expenses.forEach(expense => {
      const categoryId = expense.category_id ?? null;
      const categoryName = expense.category_name ?? 'Sem categoria';
      const key = `${categoryId ?? 'none'}:${categoryName}`;
      const current = totals.get(key);

      if (current) {
        current.total += expense.amount;
        current.count += 1;
        return;
      }

      totals.set(key, {
        categoryId,
        categoryName,
        total: expense.amount,
        count: 1,
        share: 0,
      });
    });

    const items = Array.from(totals.values()).sort(
      (left, right) => right.total - left.total || left.categoryName.localeCompare(right.categoryName),
    );

    items.forEach(item => {
      item.share = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0;
    });

    return items;
  }, [expenses, totalExpense]);

  const recentIncomes = useMemo(
    () => [...incomes].sort((left, right) => right.id - left.id).slice(0, 5),
    [incomes],
  );
  const recentExpenses = useMemo(
    () => [...expenses].sort((left, right) => right.id - left.id).slice(0, 5),
    [expenses],
  );

  const summaryCards = [
    {
      label: 'Receitas',
      value: isIncomesLoading ? '...' : formatCurrency(totalIncome),
      detail: isIncomesLoading ? 'Carregando...' : `${incomes.length} lancamentos`,
      tone: 'brand' as const,
    },
    {
      label: 'Despesas',
      value: isExpensesLoading ? '...' : formatCurrency(totalExpense),
      detail: isExpensesLoading ? 'Carregando...' : `${expenses.length} lancamentos`,
      tone: 'rose' as const,
    },
    {
      label: 'Saldo',
      value: isIncomesLoading || isExpensesLoading ? '...' : formatCurrency(balance),
      detail:
        isIncomesLoading || isExpensesLoading
          ? 'Carregando...'
          : balance >= 0
            ? 'Saldo positivo'
            : 'Saldo negativo',
      tone: 'slate' as const,
    },
    {
      label: 'Categorias',
      value: isCategoriesLoading ? '...' : String(categories.length),
      detail: isCategoriesLoading ? 'Carregando...' : 'Base cadastrada',
      tone: 'amber' as const,
    },
  ];

  async function handleRefreshAll() {
    await Promise.all([refetchCategories(), refetchExpenses(), refetchIncomes()]);
  }

  async function handleDownloadReport() {
    try {
      setIsDownloadingReport(true);
      setReportError(null);
      await downloadReportCsv();
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Erro ao gerar relatorio');
    } finally {
      setIsDownloadingReport(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-800">
              MoneyTrack
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Dashboard
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              Centralize receitas, despesas, categorias e relatorio em um unico painel.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {sectionLinks.map(section => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                >
                  {section.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleRefreshAll}>
                Recarregar dados
              </Button>
              <Button onClick={handleDownloadReport} disabled={isDownloadingReport}>
                {isDownloadingReport ? 'Gerando relatorio...' : 'Baixar relatorio CSV'}
              </Button>
            </div>
            {reportError ? <p className="text-sm text-rose-600">{reportError}</p> : null}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section id="resumo" className="scroll-mt-24 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map(card => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                detail={card.detail}
                tone={card.tone}
              />
            ))}
          </div>
        </section>

        <section id="relatorio" className="scroll-mt-24 mt-10 space-y-4">
          <SectionTitle
            eyebrow="Relatorio"
            title="Visao consolidada"
            description="A distribuicao abaixo mostra onde o dinheiro esta entrando, onde esta saindo e quais categorias concentram mais gasto."
            action={
              <>
                <Button variant="secondary" onClick={handleRefreshAll}>
                  Atualizar
                </Button>
                <Button onClick={handleDownloadReport} disabled={isDownloadingReport}>
                  {isDownloadingReport ? 'Gerando relatorio...' : 'Baixar CSV'}
                </Button>
              </>
            }
          />

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                    Receitas
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Despesas
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(totalExpense)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Saldo
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(balance)}</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Categorias
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{categories.length}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Despesas por categoria
                  </h3>
                  <span className="text-xs text-slate-400">
                    {expenseBreakdown.length} {expenseBreakdown.length === 1 ? 'categoria' : 'categorias'}
                  </span>
                </div>

                {expenseBreakdown.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm text-slate-500">Nenhuma despesa cadastrada ainda.</p>
                    <p className="mt-1 text-xs text-slate-400">Lancamentos novos aparecem aqui automaticamente.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenseBreakdown.map(item => (
                      <div key={`${item.categoryId ?? 'none'}-${item.categoryName}`} className="space-y-2">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="truncate font-medium text-slate-700">{item.categoryName}</span>
                          <span className="shrink-0 font-semibold text-slate-900">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${item.share}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>
                            {item.count} {item.count === 1 ? 'lancamento' : 'lancamentos'}
                          </span>
                          <span>{item.share.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="space-y-6">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Ultimas receitas
                    </h3>
                    <span className="text-xs text-slate-400">{recentIncomes.length} itens</span>
                  </div>

                  {recentIncomes.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                      <p className="text-sm text-slate-500">Nenhuma receita cadastrada.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {recentIncomes.map(income => (
                        <TransactionLine
                          key={income.id}
                          title={income.description}
                          amount={income.amount}
                          note={`id ${income.id}`}
                          tone="brand"
                        />
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Ultimas despesas
                    </h3>
                    <span className="text-xs text-slate-400">{recentExpenses.length} itens</span>
                  </div>

                  {recentExpenses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                      <p className="text-sm text-slate-500">Nenhuma despesa cadastrada.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {recentExpenses.map((expense: Expense) => (
                        <TransactionLine
                          key={expense.id}
                          title={expense.description}
                          amount={expense.amount}
                          note={expense.category_name ?? 'Sem categoria'}
                          tone="rose"
                        />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="categorias" className="scroll-mt-24 mt-10 space-y-4">
          <SectionTitle
            eyebrow="Categorias"
            title="Cadastro e controle"
            description="Organize receitas e despesas por categoria para manter o painel legivel."
            action={<Button variant="secondary" onClick={refetchCategories}>Recarregar categorias</Button>}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <CategoryForm
              onSubmit={addCategory}
              isSubmitting={isCategoriesSubmitting}
              submitError={categorySubmitError}
            />
            <CategoryList
              categories={categories}
              isLoading={isCategoriesLoading}
              error={categoriesError}
              deletingId={deletingCategoryId}
              onRetry={refetchCategories}
              onDelete={removeCategory}
            />
          </div>
        </section>

        <section id="despesas" className="scroll-mt-24 mt-10 space-y-4">
          <SectionTitle
            eyebrow="Despesas"
            title="Lancamentos de saida"
            description="Cadastre, revise e remova despesas sem sair do painel."
            action={<Button variant="secondary" onClick={refetchExpenses}>Recarregar despesas</Button>}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <ExpenseForm
              categories={categories}
              isCategoriesLoading={isCategoriesLoading}
              onSubmit={addExpense}
              isSubmitting={isExpensesSubmitting}
              submitError={expenseSubmitError}
            />
            <ExpenseList
              expenses={expenses}
              isLoading={isExpensesLoading}
              error={expensesError}
              deletingId={deletingExpenseId}
              onRetry={refetchExpenses}
              onDelete={removeExpense}
            />
          </div>
        </section>

        <section id="receitas" className="scroll-mt-24 mt-10 space-y-4 pb-12">
          <SectionTitle
            eyebrow="Receitas"
            title="Lancamentos de entrada"
            description="Registre entradas e acompanhe o saldo consolidado em tempo real."
            action={<Button variant="secondary" onClick={refetchIncomes}>Recarregar receitas</Button>}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <IncomeForm
              onSubmit={addIncome}
              isSubmitting={isIncomesSubmitting}
              submitError={incomeSubmitError}
            />
            <IncomeList
              incomes={incomes}
              isLoading={isIncomesLoading}
              error={incomesError}
              deletingId={deletingIncomeId}
              onRetry={refetchIncomes}
              onDelete={removeIncome}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;
