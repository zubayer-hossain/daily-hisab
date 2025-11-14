import { auth } from '@/lib/auth';
import { db } from '@/lib/db/supabase';
import { CategoryCard } from './category-card';
import { Card } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';

export async function CategoryList() {
  const session = await auth();
  const t = await getTranslations();
  
  if (!session?.user?.id) return null;

  const categories = await db.getCategories(session.user.id);

  if (categories.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{t('category.noCategories')}</p>
        <p className="text-sm text-muted-foreground mt-1">{t('category.addNewCategory')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

