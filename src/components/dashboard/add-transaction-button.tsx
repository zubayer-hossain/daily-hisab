'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { cn } from '@/lib/utils';

export function AddTransactionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-20 right-4 md:bottom-6',
          'h-14 w-14 rounded-full',
          'bg-blue-600 dark:bg-blue-500',
          'text-white',
          'hover:bg-blue-700 dark:hover:bg-blue-600',
          'shadow-lg shadow-black/20',
          'flex items-center justify-center',
          'transition-all duration-200',
          'z-50',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'active:scale-95'
        )}
        aria-label="Add transaction"
      >
        <Plus className="h-7 w-7 stroke-[3] text-white" />
      </button>

      <AddTransactionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

