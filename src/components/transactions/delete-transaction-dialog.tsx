'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string | null;
  date: Date;
  time: string;
  category: {
    id: string;
    name: string;
    icon: string;
  };
}

interface DeleteTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({ transaction, open, onOpenChange }: DeleteTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete transaction');
      }

      toast({
        title: t('transaction.success'),
        description: t('transaction.transactionDeleted'),
      });

      router.refresh();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('transaction.failedToDelete'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('transaction.deleteTransaction')}</DialogTitle>
          <DialogDescription>
            {t('transaction.deleteConfirmation')}
            <br />
            <br />
            <strong>{transaction.category.icon} {transaction.category.name}</strong>
            <br />
            {formatDate(transaction.date)} • {transaction.time}
            <br />
            <span className={transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}>
              {transaction.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(Number(transaction.amount), 'en-US', 'USD')}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

