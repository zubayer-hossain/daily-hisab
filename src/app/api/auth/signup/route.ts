import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        locale: 'bn',
        theme: 'dark',
      },
    });

    // Create default categories for the user
    const defaultCategories = [
      // Income Categories
      { name: 'Salary', nameBn: 'বেতন', color: '#10b981', icon: '💼', type: 'INCOME', order: 1 },
      { name: 'Business', nameBn: 'ব্যবসা', color: '#3b82f6', icon: '🏢', type: 'INCOME', order: 2 },
      { name: 'Investment', nameBn: 'বিনিয়োগ', color: '#8b5cf6', icon: '📈', type: 'INCOME', order: 3 },
      { name: 'Gift', nameBn: 'উপহার', color: '#ec4899', icon: '🎁', type: 'INCOME', order: 4 },
      { name: 'Others', nameBn: 'অন্যান্য', color: '#6b7280', icon: '💰', type: 'INCOME', order: 5 },
      // Expense Categories
      { name: 'Food & Dining', nameBn: 'খাদ্য ও খাওয়া', color: '#ef4444', icon: '🍔', type: 'EXPENSE', order: 1 },
      { name: 'Transportation', nameBn: 'যাতায়াত', color: '#f59e0b', icon: '🚗', type: 'EXPENSE', order: 2 },
      { name: 'Shopping', nameBn: 'কেনাকাটা', color: '#ec4899', icon: '🛍️', type: 'EXPENSE', order: 3 },
      { name: 'Entertainment', nameBn: 'বিনোদন', color: '#8b5cf6', icon: '🎬', type: 'EXPENSE', order: 4 },
      { name: 'Bills & Utilities', nameBn: 'বিল ও ইউটিলিটি', color: '#06b6d4', icon: '💡', type: 'EXPENSE', order: 5 },
      { name: 'Healthcare', nameBn: 'স্বাস্থ্যসেবা', color: '#10b981', icon: '⚕️', type: 'EXPENSE', order: 6 },
      { name: 'Education', nameBn: 'শিক্ষা', color: '#3b82f6', icon: '📚', type: 'EXPENSE', order: 7 },
      { name: 'Rent', nameBn: 'ভাড়া', color: '#f97316', icon: '🏠', type: 'EXPENSE', order: 8 },
      { name: 'Insurance', nameBn: 'বীমা', color: '#14b8a6', icon: '🛡️', type: 'EXPENSE', order: 9 },
      { name: 'Others', nameBn: 'অন্যান্য', color: '#6b7280', icon: '📦', type: 'EXPENSE', order: 10 },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        userId: user.id,
        isDefault: true,
      })),
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

