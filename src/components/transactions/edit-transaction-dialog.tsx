'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategorySelect } from './category-select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
  date: z.string(),
  time: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

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

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface EditTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: Number(transaction.amount),
      categoryId: transaction.categoryId,
      description: transaction.description || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      time: transaction.time,
    },
  });

  // Reset form when transaction changes
  useEffect(() => {
    if (open) {
      setValue('amount', Number(transaction.amount));
      setValue('categoryId', transaction.categoryId);
      setValue('description', transaction.description || '');
      setValue('date', format(new Date(transaction.date), 'yyyy-MM-dd'));
      setValue('time', transaction.time);
    }
  }, [transaction, open, setValue]);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();
      return result.data || [];
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      toast({
        title: t('transaction.success'),
        description: t('transaction.transactionUpdated'),
      });

      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('transaction.failedToUpdate'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('transaction.editTransaction')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-amount">{t('transaction.amountLabel')} *</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              placeholder="0"
              {...register('amount', { valueAsNumber: true })}
              className="text-2xl font-bold"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-categoryId">{t('transaction.categoryLabel')} *</Label>
            <CategorySelect
              value={watch('categoryId')}
              onValueChange={(value) => setValue('categoryId', value)}
              categories={categories}
              disabled={categoriesLoading}
              placeholder={categoriesLoading ? t('common.loading') : t('transaction.selectCategory')}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{t('transaction.descriptionLabel')}</Label>
            <Input
              id="edit-description"
              placeholder={t('transaction.descriptionPlaceholder')}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">{t('common.date')} *</Label>
              <Input id="edit-date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">{t('common.time')} *</Label>
              <Input id="edit-time" type="time" {...register('time')} />
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? t('transaction.updating') : t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

