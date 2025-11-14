'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddCategoryDialog } from './add-category-dialog';
import { useTranslations } from 'next-intl';

export function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t('category.newCategory')}
      </Button>

      <AddCategoryDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

