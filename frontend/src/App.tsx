import CategoriesPage from '@/pages/CategoriesPage';

import IncomesPage from '@/pages/IncomesPage';

<Route path="/incomes" element={<IncomesPage />} />

const App = () => {
  return <CategoriesPage />;
};

export default App;