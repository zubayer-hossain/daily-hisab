'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface SummaryData {
  thisMonth: {
    income: number;
    expense: number;
    balance: number;
  };
  total: {
    income: number;
    expense: number;
    balance: number;
  };
}

interface SummaryCardsMobileProps {
  data: SummaryData;
  locale: string;
  currency: string;
}

export function SummaryCardsMobile({ data, locale, currency }: SummaryCardsMobileProps) {
  const [activeTab, setActiveTab] = useState<'total' | 'thisMonth'>('total');
  const t = useTranslations();

  const currentData = activeTab === 'total' ? data.total : data.thisMonth;

  return (
    <div className="md:hidden">
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'total' | 'thisMonth')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-full">
              <TabsTrigger
                value="thisMonth"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:rounded-full text-gray-700 font-medium rounded-full"
              >
                {t('dashboard.thisMonth')}
              </TabsTrigger>
              <TabsTrigger
                value="total"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:rounded-full text-gray-700 font-medium rounded-full"
              >
                {t('dashboard.total')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Data Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Income */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('common.income')}</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(currentData.income, locale, currency)}
              </p>
            </div>

            {/* Expense */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('common.expense')}</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(currentData.expense, locale, currency)}
              </p>
            </div>

            {/* Balance */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('common.balance')}</p>
              <p
                className={`text-xl font-bold ${
                  currentData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}
              >
                {formatCurrency(currentData.balance, locale, currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

