'use client';

import { useTranslations } from 'next-intl';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

type Props = {
  income: number;
  expense: number;
  currency: string;
  locale: string;
};

const COLORS = {
  income: '#10b981', // green
  expense: '#ef4444', // red
};

export function IncomeExpenseChart({ income, expense, currency, locale }: Props) {
  const t = useTranslations();

  const data = [
    { name: t('common.income'), value: income, color: COLORS.income },
    { name: t('common.expense'), value: expense, color: COLORS.expense },
  ];

  if (income === 0 && expense === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        {t('reports.noDataAvailable')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          outerRadius={70}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value, locale, currency)}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

