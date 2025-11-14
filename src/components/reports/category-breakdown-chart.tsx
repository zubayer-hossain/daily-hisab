'use client';

import { useTranslations } from 'next-intl';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

type Props = {
  data: Array<{ category: string; amount: number; color: string }>;
  currency: string;
  locale: string;
};

const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

export function CategoryBreakdownChart({ data, currency, locale }: Props) {
  const t = useTranslations();

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        {t('reports.noDataAvailable')}
      </div>
    );
  }

  // Assign colors if not provided
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          outerRadius={70}
          fill="#8884d8"
          dataKey="amount"
          nameKey="category"
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value, locale, currency)}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

