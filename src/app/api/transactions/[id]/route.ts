import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await db.getTransaction(id, session.user.id);

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...transaction,
        amount: parseFloat(transaction.amount.toString()),
      },
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTransactionSchema.parse(body);

    // Verify transaction belongs to user
    const existingTransaction = await db.getTransaction(id, session.user.id);

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // If categoryId is provided, verify it belongs to user
    if (validatedData.categoryId) {
      const category = await db.getCategory(validatedData.categoryId, session.user.id);

      if (!category) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount;
    if (validatedData.categoryId) updateData.categoryId = validatedData.categoryId;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.date) updateData.date = new Date(validatedData.date);
    if (validatedData.time) updateData.time = validatedData.time;
    if (validatedData.tags) updateData.tags = validatedData.tags;

    const transaction = await db.updateTransaction(id, updateData);

    return NextResponse.json({
      data: {
        ...transaction,
        amount: parseFloat(transaction.amount.toString()),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify transaction belongs to user
    const existingTransaction = await db.getTransaction(id, session.user.id);

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await db.deleteTransaction(id);

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

