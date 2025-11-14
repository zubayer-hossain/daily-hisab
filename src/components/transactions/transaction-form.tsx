'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategorySelect } from './category-select';
import { useToast } from '@/hooks/use-toast';
import { TransactionType } from '@prisma/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
  date: z.string(),
  time: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  type: TransactionType;
  onSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export function TransactionForm({ type, onSuccess }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
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
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    },
  });

  // Fetch categories for this transaction type
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<{ data: Category[] }>({
    queryKey: ['categories', type],
    queryFn: async () => {
      const response = await fetch(`/api/categories?type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const categories = categoriesData?.data || [];

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (result.error && Array.isArray(result.error)) {
          const errorMessages = result.error.map((err: any) => err.message || err).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(result.error || 'Failed to create transaction');
      }

      toast({
        title: t('transaction.success'),
        description: t('transaction.transactionCreated'),
      });

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Close dialog first
      onSuccess();
      
      // Reset form
      setValue('amount', 0);
      setValue('categoryId', undefined as any);
      setValue('description', '');
      
      // Refresh server components after a small delay to ensure API has completed
      // This ensures SummaryCards and TransactionList get fresh data
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error: any) {
      toast({
        title: t('transaction.error'),
        description: error.message || t('transaction.failedToCreate'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="amount">{t('transaction.amountLabel')} *</Label>
        <Input
          id="amount"
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
        <Label htmlFor="categoryId">{t('transaction.categoryLabel')} *</Label>
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
        <Label htmlFor="description">{t('transaction.descriptionLabel')}</Label>
        <Input
          id="description"
          placeholder={t('transaction.descriptionPlaceholder')}
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">{t('common.date')} *</Label>
          <Input id="date" type="date" {...register('date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">{t('common.time')} *</Label>
          <Input id="time" type="time" {...register('time')} />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        variant={type === 'INCOME' ? 'income' : 'expense'}
        disabled={isLoading}
      >
        {isLoading ? t('transaction.creating') : t('common.add')}
      </Button>
    </form>
  );
}

