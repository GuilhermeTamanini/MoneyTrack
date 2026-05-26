import { useState } from 'react';
import CategoriesPage from '@/pages/CategoriesPage';
import ExpensesPage from '@/pages/ExpensesPage';
import IncomesPage from '@/pages/IncomesPage';

type Page = 'categories' | 'expenses' | 'incomes';

const pages: Record<Page, { label: string; component: JSX.Element }> = {
  categories: { label: 'Categorias', component: <CategoriesPage /> },
  expenses: { label: 'Despesas', component: <ExpensesPage /> },
  incomes: { label: 'Receitas', component: <IncomesPage /> },
};

const pageOrder: Page[] = ['categories', 'expenses', 'incomes'];

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('categories');

  return (
    <>
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
          {pageOrder.map(page => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={[
                'rounded-xl px-4 py-2 text-sm font-semibold transition',
                currentPage === page
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700',
              ].join(' ')}
            >
              {pages[page].label}
            </button>
          ))}
        </div>
      </nav>
      {pages[currentPage].component}
    </>
  );
};

export default App;
