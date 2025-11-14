import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
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
    const existingUser = await db.getUserByEmail(validatedData.email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await db.createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      locale: 'bn',
      theme: 'dark',
    });

    // Create default categories for the user
    const defaultCategories = [
      // Income Categories
      { name: 'Salary', icon: '💼', order: 1, userId: user.id, isDefault: true },
      { name: 'Business', icon: '🏢', order: 2, userId: user.id, isDefault: true },
      { name: 'Investment', icon: '📈', order: 3, userId: user.id, isDefault: true },
      { name: 'Gift', icon: '🎁', order: 4, userId: user.id, isDefault: true },
      { name: 'Others', icon: '💰', order: 5, userId: user.id, isDefault: true },
      // Expense Categories
      { name: 'Food & Dining', icon: '🍔', order: 1, userId: user.id, isDefault: true },
      { name: 'Transportation', icon: '🚗', order: 2, userId: user.id, isDefault: true },
      { name: 'Shopping', icon: '🛍️', order: 3, userId: user.id, isDefault: true },
      { name: 'Entertainment', icon: '🎬', order: 4, userId: user.id, isDefault: true },
      { name: 'Bills & Utilities', icon: '💡', order: 5, userId: user.id, isDefault: true },
      { name: 'Healthcare', icon: '⚕️', order: 6, userId: user.id, isDefault: true },
      { name: 'Education', icon: '📚', order: 7, userId: user.id, isDefault: true },
      { name: 'Rent', icon: '🏠', order: 8, userId: user.id, isDefault: true },
      { name: 'Insurance', icon: '🛡️', order: 9, userId: user.id, isDefault: true },
      { name: 'Others', icon: '📦', order: 10, userId: user.id, isDefault: true },
    ];

    await db.createCategories(defaultCategories);

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

