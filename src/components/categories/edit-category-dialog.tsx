'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().min(1, 'Icon is required'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const icons = ['💼', '🏢', '📈', '🎁', '💰', '🍔', '🚗', '🛍️', '🎬', '💡', '⚕️', '📚', '🏠', '🛡️', '📦'];

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog({ category, open, onOpenChange }: EditCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      icon: category.icon,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category.name,
        icon: category.icon,
      });
    }
  }, [category, open, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update category');
      }

      toast({
        title: t('category.success'),
        description: t('category.categoryUpdated'),
      });

      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.refresh();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t('category.error'),
        description: error.message || t('category.failedToUpdate'),
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
          <DialogTitle>{t('category.editCategory')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t('common.name')} *</Label>
            <Input
              id="edit-name"
              placeholder={t('category.namePlaceholder')}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('common.icon')}</Label>
            <div className="grid grid-cols-8 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue('icon', icon)}
                  className={`h-10 w-10 rounded-md border-2 text-xl transition-all ${
                    watch('icon') === icon
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-border'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('category.updating') : t('common.edit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

