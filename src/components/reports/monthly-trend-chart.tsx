'use client';

import { useTranslations } from 'next-intl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

type Props = {
  data: Array<{ month: string; income: number; expense: number }>;
  currency: string;
  locale: string;
};

export function MonthlyTrendChart({ data, currency, locale }: Props) {
  const t = useTranslations();

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        {t('reports.noDataAvailable')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" style={{ fontSize: '11px' }} />
        <YAxis style={{ fontSize: '11px' }} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value, locale, currency)}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={2}
          name={t('common.income')}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2}
          name={t('common.expense')}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

