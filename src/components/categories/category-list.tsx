import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { CategoryCard } from './category-card';
import { Card } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';

export async function CategoryList() {
  const session = await auth();
  const t = await getTranslations();
  
  if (!session?.user?.id) return null;

  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      order: 'asc',
    },
  });

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

