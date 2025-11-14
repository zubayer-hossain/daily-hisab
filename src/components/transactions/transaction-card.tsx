'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { EditTransactionDialog } from './edit-transaction-dialog';
import { DeleteTransactionDialog } from './delete-transaction-dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
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

interface TransactionCardProps {
  transaction: Transaction;
  locale: string;
  currency: string;
}

export function TransactionCard({ transaction, locale, currency }: TransactionCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const t = useTranslations();

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-accent">
              {transaction.category.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium">{transaction.category.name}</p>
              {transaction.description && (
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDate(transaction.date)} • {transaction.time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`text-lg font-bold ${
                transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {transaction.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(Number(transaction.amount), locale, currency)}
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>{t('common.edit')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{t('common.delete')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      <EditTransactionDialog
        transaction={transaction}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteTransactionDialog
        transaction={transaction}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

