import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ReportsClient } from '@/components/reports/reports-client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/supabase';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default async function ReportsPage() {
  const session = await auth();
  const t = await getTranslations();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch categories and user preferences
  const [categories, user] = await Promise.all([
    db.getCategories(session.user.id),
    db.getUser(session.user.id),
  ]);

  return (
    <div className="container mx-auto p-3 md:p-4 space-y-4 md:space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('reports.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('reports.summary')}
        </p>
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsClient
          userId={session.user.id}
          categories={categories}
          currency={user?.currency || 'BDT'}
          locale={user?.locale || 'bn'}
        />
      </Suspense>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </Card>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-24 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-64 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>
    </div>
  );
}

