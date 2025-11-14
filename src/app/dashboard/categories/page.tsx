import { Suspense } from 'react';
import { CategoryList } from '@/components/categories/category-list';
import { AddCategoryButton } from '@/components/categories/add-category-button';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ক্যাটাগরি</h1>
        <AddCategoryButton />
      </div>

      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryList />
      </Suspense>
    </div>
  );
}

function CategoryListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

