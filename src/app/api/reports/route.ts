import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/supabase';
import { format, parseISO, startOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Fetch transactions with filters
    const transactions = await db.getTransactions(session.user.id, {
      startDate: parseISO(startDate),
      endDate: parseISO(endDate),
      ...(categoryId && { categoryId }),
      ...(type && { type }),
    });

    // Calculate summary statistics
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const balance = totalIncome - totalExpense;
    const transactionCount = transactions.length;

    // Category breakdown
    const categoryMap = new Map<string, { amount: number; type: string; count: number }>();
    
    transactions.forEach((transaction) => {
      const categoryName = transaction.category?.name || 'Unknown';
      const key = `${categoryName}-${transaction.type}`;
      
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { amount: 0, type: transaction.type, count: 0 });
      }
      
      const category = categoryMap.get(key)!;
      category.amount += parseFloat(transaction.amount.toString());
      category.count += 1;
    });

    const categoryBreakdownIncome: Array<{ category: string; amount: number; color: string }> = [];
    const categoryBreakdownExpense: Array<{ category: string; amount: number; color: string }> = [];

    categoryMap.forEach((value, key) => {
      const categoryName = key.split('-')[0];
      const data = {
        category: categoryName,
        amount: value.amount,
        color: getColorForCategory(categoryName),
      };

      if (value.type === 'INCOME') {
        categoryBreakdownIncome.push(data);
      } else {
        categoryBreakdownExpense.push(data);
      }
    });

    // Sort by amount descending
    categoryBreakdownIncome.sort((a, b) => b.amount - a.amount);
    categoryBreakdownExpense.sort((a, b) => b.amount - a.amount);

    // Monthly trend
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach((transaction) => {
      const monthKey = format(new Date(transaction.date), 'MMM yyyy');
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }
      
      const month = monthlyMap.get(monthKey)!;
      const amount = parseFloat(transaction.amount.toString());
      
      if (transaction.type === 'INCOME') {
        month.income += amount;
      } else {
        month.expense += amount;
      }
    });

    const monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }))
      .sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    // Top categories (combined income and expense)
    const topCategoriesMap = new Map<
      string,
      { type: string; amount: number; count: number }
    >();

    categoryMap.forEach((value, key) => {
      const categoryName = key.split('-')[0];
      
      if (!topCategoriesMap.has(categoryName)) {
        topCategoriesMap.set(categoryName, {
          type: value.type,
          amount: 0,
          count: 0,
        });
      }
      
      const category = topCategoriesMap.get(categoryName)!;
      category.amount += value.amount;
      category.count += value.count;
    });

    const totalAmount = totalIncome + totalExpense;
    
    const topCategories = Array.from(topCategoriesMap.entries())
      .map(([category, data]) => ({
        category,
        type: data.type,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 categories

    const reportData = {
      totalIncome,
      totalExpense,
      balance,
      transactionCount,
      transactions: transactions.slice(0, 100), // Limit for performance
      categoryBreakdown: {
        income: categoryBreakdownIncome,
        expense: categoryBreakdownExpense,
      },
      monthlyTrend,
      topCategories,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Helper function to get consistent colors for categories
function getColorForCategory(category: string): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // green
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#ef4444', // red
    '#6366f1', // indigo
  ];

  // Simple hash function to get consistent color for category
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

