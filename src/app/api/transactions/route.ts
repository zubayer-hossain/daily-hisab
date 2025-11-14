import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string(),
  description: z.string().optional(),
  date: z.string(),
  time: z.string(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null;
    const categoryId = searchParams.get('categoryId');

    const transactions = await db.getTransactions(session.user.id, {
      limit,
      offset,
      type: type === 'INCOME' || type === 'EXPENSE' ? type : undefined,
      categoryId: categoryId || undefined,
    });

    // Serialize transactions to plain objects (convert Decimal to number)
    const serializedTransactions = transactions.map((transaction) => ({
      ...transaction,
      amount: parseFloat(transaction.amount.toString()),
    }));

    const total = await db.countTransactions(session.user.id, {
      type: type === 'INCOME' || type === 'EXPENSE' ? type : undefined,
      categoryId: categoryId || undefined,
    });

    return NextResponse.json({
      data: serializedTransactions,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // Verify category belongs to user
    const category = await db.getCategory(validatedData.categoryId, session.user.id);

    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const transaction = await db.createTransaction({
      userId: session.user.id,
      amount: validatedData.amount,
      type: validatedData.type,
      categoryId: validatedData.categoryId,
      description: validatedData.description,
      date: new Date(validatedData.date),
      time: validatedData.time,
      tags: validatedData.tags || [],
      attachments: [],
    });

    // Revalidate the dashboard page to refresh server components
    revalidatePath('/dashboard');

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

