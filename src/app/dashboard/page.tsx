import { Suspense } from 'react';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { AddTransactionButton } from '@/components/dashboard/add-transaction-button';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations();
  
  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Summary Cards */}
      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummaryCards />
      </Suspense>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('dashboard.recentTransactions')}</h2>
        </div>
        <Suspense fallback={<TransactionListSkeleton />}>
          <TransactionList />
        </Suspense>
      </div>

      {/* Floating Action Button */}
      <AddTransactionButton />
    </div>
  );
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 bg-card rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

