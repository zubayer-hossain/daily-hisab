'use client';

import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Props = {
  data: Array<{
    category: string;
    type: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  currency: string;
  locale: string;
};

export function TopCategoriesTable({ data, currency, locale }: Props) {
  const t = useTranslations();

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('reports.noDataAvailable')}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">{t('common.category')}</TableHead>
            <TableHead className="text-xs">{t('common.total')}</TableHead>
            <TableHead className="text-xs text-center hidden sm:table-cell">{t('reports.totalTransactions')}</TableHead>
            <TableHead className="text-xs text-right">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-xs p-3">
                <div className="flex flex-col gap-1">
                  <span className="truncate max-w-[120px]">{item.category}</span>
                  <Badge 
                    variant={item.type === 'INCOME' ? 'default' : 'destructive'}
                    className="text-[10px] w-fit"
                  >
                    {item.type === 'INCOME' ? t('common.income') : t('common.expense')}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className={`text-xs p-3 font-semibold ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(item.amount, locale, currency)}
              </TableCell>
              <TableCell className="text-xs p-3 text-center hidden sm:table-cell">{item.count}</TableCell>
              <TableCell className="text-xs p-3 text-right font-medium">{item.percentage.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

