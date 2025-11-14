'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionForm } from './transaction-form';
import { useTranslations } from 'next-intl';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('transaction.addIncome')}</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as 'INCOME' | 'EXPENSE')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="INCOME" className="text-green-500 data-[state=active]:bg-green-500/10">
              {t('common.income')}
            </TabsTrigger>
            <TabsTrigger value="EXPENSE" className="text-red-500 data-[state=active]:bg-red-500/10">
              {t('common.expense')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="INCOME">
            <TransactionForm type="INCOME" onSuccess={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="EXPENSE">
            <TransactionForm type="EXPENSE" onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

