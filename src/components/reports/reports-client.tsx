'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportFilters } from './report-filters';
import { CategoryBreakdownChart } from './category-breakdown-chart';
import { MonthlyTrendChart } from './monthly-trend-chart';
import { IncomeExpenseChart } from './income-expense-chart';
import { TopCategoriesTable } from './top-categories-table';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

type Category = {
  id: string;
  name: string;
  icon: string;
};

type ReportData = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  transactions: any[];
  categoryBreakdown: {
    income: Array<{ category: string; amount: number; color: string }>;
    expense: Array<{ category: string; amount: number; color: string }>;
  };
  monthlyTrend: Array<{ month: string; income: number; expense: number }>;
  topCategories: Array<{ category: string; type: string; amount: number; count: number; percentage: number }>;
};

type FilterValues = {
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE' | '';
};

type Props = {
  userId: string;
  categories: Category[];
  currency: string;
  locale: string;
};

const CURRENCY_LOCALES: Record<string, string> = {
  BDT: 'bn-BD',
  USD: 'en-US',
  EUR: 'en-EU',
  GBP: 'en-GB',
  INR: 'en-IN',
  PKR: 'en-PK',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  AUD: 'en-AU',
  CAD: 'en-CA',
};

export function ReportsClient({ userId, categories, currency, locale: userLocale }: Props) {
  const t = useTranslations();
  const locale = CURRENCY_LOCALES[currency] || 'en-US';
  
  const [filters, setFilters] = useState<FilterValues>({
    period: 'thisMonth',
  });
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const dateRange = getDateRange(filters.period, filters.customStartDate, filters.customEndDate);
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      if (filters.categoryId) {
        params.append('categoryId', filters.categoryId);
      }
      if (filters.type) {
        params.append('type', filters.type);
      }

      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch report data');
      
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string, customStart?: Date, customEnd?: Date) => {
    const now = new Date();
    
    switch (period) {
      case 'today':
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
      case 'thisWeek':
        return { startDate: startOfWeek(now), endDate: endOfWeek(now) };
      case 'thisMonth':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
      case 'last3Months':
        return { startDate: startOfMonth(subMonths(now, 2)), endDate: endOfMonth(now) };
      case 'last6Months':
        return { startDate: startOfMonth(subMonths(now, 5)), endDate: endOfMonth(now) };
      case 'thisYear':
        return { startDate: startOfYear(now), endDate: endOfYear(now) };
      case 'lastYear':
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        return { startDate: startOfYear(lastYear), endDate: endOfYear(lastYear) };
      case 'custom':
        return {
          startDate: customStart || startOfMonth(now),
          endDate: customEnd || endOfMonth(now),
        };
      default:
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    try {
      const dateRange = getDateRange(filters.period, filters.customStartDate, filters.customEndDate);
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        format,
      });

      if (filters.categoryId) {
        params.append('categoryId', filters.categoryId);
      }
      if (filters.type) {
        params.append('type', filters.type);
      }

      const response = await fetch(`/api/reports/export?${params.toString()}`);
      
      if (!response.ok) throw new Error('Failed to export report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${format}-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'html'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert(t('reports.exportFailed'));
    }
  };

  if (loading) {
    return <ReportLoadingSkeleton />;
  }

  if (!reportData) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">{t('reports.noDataAvailable')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <ReportFilters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onExport={handleExportReport}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">{t('common.income')}</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg md:text-2xl font-bold text-green-500">
              {formatCurrency(reportData.totalIncome, locale, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">{t('common.expense')}</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg md:text-2xl font-bold text-red-500">
              {formatCurrency(reportData.totalExpense, locale, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">{t('common.balance')}</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className={`text-lg md:text-2xl font-bold ${reportData.balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
              {formatCurrency(reportData.balance, locale, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">{t('reports.totalTransactions')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg md:text-2xl font-bold text-purple-500">
              {reportData.transactionCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {/* Income vs Expense Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('reports.incomeVsExpense')}</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <IncomeExpenseChart
              income={reportData.totalIncome}
              expense={reportData.totalExpense}
              currency={currency}
              locale={locale}
            />
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('reports.monthlyTrend')}</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <MonthlyTrendChart
              data={reportData.monthlyTrend}
              currency={currency}
              locale={locale}
            />
          </CardContent>
        </Card>

        {/* Category Breakdown - Income */}
        {reportData.categoryBreakdown.income.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('dashboard.categoryWiseIncome')}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <CategoryBreakdownChart
                data={reportData.categoryBreakdown.income}
                currency={currency}
                locale={locale}
              />
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown - Expense */}
        {reportData.categoryBreakdown.expense.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('dashboard.categoryWiseExpense')}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <CategoryBreakdownChart
                data={reportData.categoryBreakdown.expense}
                currency={currency}
                locale={locale}
              />
            </CardContent>
          </Card>
        )}

        {/* Top Categories Table */}
        {reportData.topCategories.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('reports.topCategories')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TopCategoriesTable
                data={reportData.topCategories}
                currency={currency}
                locale={locale}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ReportLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-3">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-16 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-64 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>
    </div>
  );
}

async function handleExport(format: 'csv' | 'pdf', data: ReportData) {
  // This will be implemented in the component
}

