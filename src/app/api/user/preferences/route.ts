import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  locale: z.enum(['bn', 'en']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  currency: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePreferencesSchema.parse(body);

    const updateData: any = {};
    if (validatedData.locale) updateData.locale = validatedData.locale;
    if (validatedData.theme) updateData.theme = validatedData.theme;
    if (validatedData.currency) updateData.currency = validatedData.currency;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { locale: true, theme: true, currency: true },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

