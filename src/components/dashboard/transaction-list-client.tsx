'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TransactionCard } from '@/components/transactions/transaction-card';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string | null;
  date: Date;
  time: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    icon: string;
  };
}

interface TransactionListClientProps {
  locale: string;
  currency: string;
}

const ITEMS_PER_PAGE = 50;

export function TransactionListClient({ locale, currency }: TransactionListClientProps) {
  const t = useTranslations();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Fetch transactions with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['transactions', 'paginated'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/transactions?limit=${ITEMS_PER_PAGE}&offset=${pageParam}`
      );
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < ITEMS_PER_PAGE) return undefined;
      return allPages.length * ITEMS_PER_PAGE;
    },
    initialPageParam: 0,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsIntersecting(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, []);

  // Fetch next page when intersecting
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into a single array
  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground mt-2">{t('common.loading')}</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{t('dashboard.noTransactionsYet')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('dashboard.clickPlusToAddTransaction')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          locale={locale}
          currency={currency}
        />
      ))}

      {/* Load More Section */}
      <div ref={loadMoreRef} className="py-4 space-y-3">
        {/* Show loaded count */}
        {transactions.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            {transactions.length} {t('transaction.transactionsLoaded')}
          </p>
        )}

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t('common.loading')}
            </span>
          </div>
        )}

        {/* Manual Load More Button */}
        {hasNextPage && !isFetchingNextPage && (
          <div className="flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary/20 rounded-md hover:bg-primary/5 transition-colors"
            >
              {t('common.loadMore')}
            </button>
          </div>
        )}

        {/* End message */}
        {!hasNextPage && transactions.length >= ITEMS_PER_PAGE && (
          <p className="text-center text-sm text-muted-foreground">
            {t('transaction.noMoreTransactions')}
          </p>
        )}
      </div>
    </div>
  );
}

