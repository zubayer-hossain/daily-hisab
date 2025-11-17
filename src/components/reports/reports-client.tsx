'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReportFilters } from './report-filters';
import { CategoryBreakdownChart } from './category-breakdown-chart';
import { MonthlyTrendChart } from './monthly-trend-chart';
import { IncomeExpenseChart } from './income-expense-chart';
import { TopCategoriesTable } from './top-categories-table';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, TrendingDown, DollarSign, Percent, BarChart3 } from 'lucide-react';
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
  const { toast } = useToast();
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
      a.download = `report-${format}-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: t('transaction.success'),
        description: t('reports.exportSuccess'),
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: t('common.error'),
        description: t('reports.exportFailed'),
        variant: 'destructive',
      });
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

  // Calculate insightful metrics
  const savingsRate = reportData.totalIncome > 0 
    ? ((reportData.balance / reportData.totalIncome) * 100).toFixed(1)
    : '0.0';
  const avgTransaction = reportData.transactionCount > 0
    ? (reportData.totalIncome + reportData.totalExpense) / reportData.transactionCount
    : 0;
  const expenseRatio = reportData.totalIncome > 0
    ? ((reportData.totalExpense / reportData.totalIncome) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ReportFilters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onExport={handleExportReport}
      />

      {/* Key Metrics - Primary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.income')}</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ArrowDownCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(reportData.totalIncome, locale, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.expense')}</CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ArrowUpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(reportData.totalExpense, locale, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className={`${reportData.balance >= 0 ? 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20' : 'border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.balance')}</CardTitle>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${reportData.balance >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                <Wallet className={`h-5 w-5 ${reportData.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl md:text-3xl font-bold ${reportData.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {formatCurrency(reportData.balance, locale, currency)}
            </div>
            {reportData.totalIncome > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {savingsRate}% {t('reports.savingsRate')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{t('reports.totalTransactions')}</p>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold">{reportData.transactionCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{t('reports.avgTransaction')}</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold">{formatCurrency(avgTransaction, locale, currency)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{t('reports.expenseRatio')}</p>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold">{expenseRatio}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{t('reports.savingsRate')}</p>
              {parseFloat(savingsRate) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className={`text-xl font-semibold ${parseFloat(savingsRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {savingsRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income vs Expense Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.incomeVsExpense')}</CardTitle>
            <CardDescription className="text-xs">
              {t('reports.incomeVsExpenseDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart
              income={reportData.totalIncome}
              expense={reportData.totalExpense}
              currency={currency}
              locale={locale}
            />
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        {reportData.monthlyTrend.length > 0 && (
          <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.monthlyTrend')}</CardTitle>
            <CardDescription className="text-xs">
              {t('reports.monthlyTrendDesc')}
            </CardDescription>
          </CardHeader>
            <CardContent>
              <MonthlyTrendChart
                data={reportData.monthlyTrend}
                currency={currency}
                locale={locale}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown - Income */}
        {reportData.categoryBreakdown.income.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.categoryWiseIncome')}</CardTitle>
              <CardDescription className="text-xs">
                {t('reports.categoryBreakdownDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.categoryWiseExpense')}</CardTitle>
              <CardDescription className="text-xs">
                {t('reports.categoryBreakdownDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBreakdownChart
                data={reportData.categoryBreakdown.expense}
                currency={currency}
                locale={locale}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Categories Table */}
      {reportData.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.topCategories')}</CardTitle>
            <CardDescription className="text-xs">
              {t('reports.topCategoriesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopCategoriesTable
              data={reportData.topCategories}
              currency={currency}
              locale={locale}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-9 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>

      {/* Primary Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-20 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>

      {/* Secondary Metrics Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-16 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-64 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>
    </div>
  );
}


