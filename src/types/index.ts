export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: Date;
  time: string;
  tags: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  isDefault: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrend {
  month: string;
  monthBn: string;
  income: number;
  expense: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  dateRange?: DateRange;
  searchQuery?: string;
  tags?: string[];
}

