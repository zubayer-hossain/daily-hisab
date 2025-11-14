import { unstable_noStore as noStore } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getTranslations } from 'next-intl/server';
import { SummaryCardsMobile } from './summary-cards-mobile';

// Map currencies to their appropriate locales for number formatting
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

export async function SummaryCards() {
  noStore(); // Prevent caching to ensure fresh data
  const session = await auth();
  const t = await getTranslations();
  
  if (!session?.user?.id) return null;

  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currency: true, locale: true },
  });

  const currency = user?.currency || 'BDT';
  // Use currency's locale for number formatting, not user's language preference
  const locale = CURRENCY_LOCALES[currency] || 'en-US';

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Get transactions for current month
  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    select: {
      amount: true,
      type: true,
    },
  });

  // Get all transactions (total)
  const allTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      amount: true,
      type: true,
    },
  });

  // Calculate this month's data
  const monthIncome = monthTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthExpense = monthTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthBalance = monthIncome - monthExpense;

  // Calculate total (all-time) data
  const totalIncome = allTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = allTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalBalance = totalIncome - totalExpense;

  // Prepare data for mobile component
  const summaryData = {
    thisMonth: {
      income: monthIncome,
      expense: monthExpense,
      balance: monthBalance,
    },
    total: {
      income: totalIncome,
      expense: totalExpense,
      balance: totalBalance,
    },
  };

  return (
    <>
      {/* Mobile View with Tabs */}
      <SummaryCardsMobile data={summaryData} locale={locale} currency={currency} />

      {/* Desktop View - Current Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalIncome')}</CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(monthIncome, locale, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.thisMonth')}</p>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalExpense')}</CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(monthExpense, locale, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.thisMonth')}</p>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('common.balance')}</CardTitle>
            <Wallet className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthBalance >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
              {formatCurrency(monthBalance, locale, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.thisMonth')}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

