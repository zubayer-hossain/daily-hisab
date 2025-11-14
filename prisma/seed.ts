import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // Income Categories
  {
    name: 'Salary',
    nameBn: 'বেতন',
    color: '#10b981',
    icon: '💼',
    type: TransactionType.INCOME,
    isDefault: true,
    order: 1,
  },
  {
    name: 'Business',
    nameBn: 'ব্যবসা',
    color: '#3b82f6',
    icon: '🏢',
    type: TransactionType.INCOME,
    isDefault: true,
    order: 2,
  },
  {
    name: 'Investment',
    nameBn: 'বিনিয়োগ',
    color: '#8b5cf6',
    icon: '📈',
    type: TransactionType.INCOME,
    isDefault: true,
    order: 3,
  },
  {
    name: 'Gift',
    nameBn: 'উপহার',
    color: '#ec4899',
    icon: '🎁',
    type: TransactionType.INCOME,
    isDefault: true,
    order: 4,
  },
  {
    name: 'Others',
    nameBn: 'অন্যান্য',
    color: '#6b7280',
    icon: '💰',
    type: TransactionType.INCOME,
    isDefault: true,
    order: 5,
  },

  // Expense Categories
  {
    name: 'Food & Dining',
    nameBn: 'খাদ্য ও খাওয়া',
    color: '#ef4444',
    icon: '🍔',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 1,
  },
  {
    name: 'Transportation',
    nameBn: 'যাতায়াত',
    color: '#f59e0b',
    icon: '🚗',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 2,
  },
  {
    name: 'Shopping',
    nameBn: 'কেনাকাটা',
    color: '#ec4899',
    icon: '🛍️',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 3,
  },
  {
    name: 'Entertainment',
    nameBn: 'বিনোদন',
    color: '#8b5cf6',
    icon: '🎬',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 4,
  },
  {
    name: 'Bills & Utilities',
    nameBn: 'বিল ও ইউটিলিটি',
    color: '#06b6d4',
    icon: '💡',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 5,
  },
  {
    name: 'Healthcare',
    nameBn: 'স্বাস্থ্যসেবা',
    color: '#10b981',
    icon: '⚕️',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 6,
  },
  {
    name: 'Education',
    nameBn: 'শিক্ষা',
    color: '#3b82f6',
    icon: '📚',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 7,
  },
  {
    name: 'Rent',
    nameBn: 'ভাড়া',
    color: '#f97316',
    icon: '🏠',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 8,
  },
  {
    name: 'Insurance',
    nameBn: 'বীমা',
    color: '#14b8a6',
    icon: '🛡️',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 9,
  },
  {
    name: 'Others',
    nameBn: 'অন্যান্য',
    color: '#6b7280',
    icon: '📦',
    type: TransactionType.EXPENSE,
    isDefault: true,
    order: 10,
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Create a test user (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        locale: 'bn',
        theme: 'dark',
      },
    });

    console.log('✅ Created test user:', testUser.email);

    // Create default categories for test user
    for (const category of defaultCategories) {
      await prisma.category.upsert({
        where: {
          userId_name_type: {
            userId: testUser.id,
            name: category.name,
            type: category.type,
          },
        },
        update: {},
        create: {
          ...category,
          userId: testUser.id,
        },
      });
    }

    console.log('✅ Created default categories');

    // Create some sample transactions
    const incomeCategory = await prisma.category.findFirst({
      where: { userId: testUser.id, type: TransactionType.INCOME },
    });

    const expenseCategory = await prisma.category.findFirst({
      where: { userId: testUser.id, type: TransactionType.EXPENSE },
    });

    if (incomeCategory && expenseCategory) {
      await prisma.transaction.create({
        data: {
          userId: testUser.id,
          categoryId: incomeCategory.id,
          amount: 50000,
          type: TransactionType.INCOME,
          description: 'Monthly salary',
          date: new Date(),
          time: '09:00',
          tags: ['salary', 'monthly'],
        },
      });

      await prisma.transaction.create({
        data: {
          userId: testUser.id,
          categoryId: expenseCategory.id,
          amount: 500,
          type: TransactionType.EXPENSE,
          description: 'Lunch at restaurant',
          date: new Date(),
          time: '13:30',
          tags: ['food', 'lunch'],
        },
      });

      console.log('✅ Created sample transactions');
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

