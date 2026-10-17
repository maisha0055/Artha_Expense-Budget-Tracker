export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  date: string;
  note: string | null;
}

export interface CreateTransactionRequest {
  amount: number;
  type: TransactionType;
  categoryId: number;
  date: string;
  note?: string | null;
}

export interface UpdateTransactionRequest {
  amount: number;
  type: TransactionType;
  categoryId: number;
  date: string;
  note?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CategoryBudget {
  categoryId: number;
  categoryName: string;
  limitAmount: number | null;
}

export interface SetBudgetRequest {
  categoryId: number;
  month: string;
  limitAmount: number | null;
}

export type BudgetStatus = 'None' | 'Ok' | 'Warning' | 'Exceeded';

export interface CategorySummary {
  categoryId: number;
  name: string;
  spent: number;
  limit: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categories: CategorySummary[];
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
