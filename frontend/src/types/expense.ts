export interface Expense {
  id: number;
  description: string;
  amount: number;
  category_id: number | null;
  category_name: string | null;
}

export interface NewExpense {
  description: string;
  amount: number;
  category_id: number;
}
