import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/supabase';
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

    const user = await db.updateUser(session.user.id, updateData);

    return NextResponse.json({
      data: {
        locale: user.locale,
        theme: user.theme,
        currency: user.currency,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

