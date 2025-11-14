import { unstable_noStore as noStore } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { redirect } from 'next/navigation';
import { TransactionListClient } from './transaction-list-client';

// Map currencies to their appropriate locales for number formatting
const CURRENCY_LOCALES: Record<string, string> = {
  BDT: 'bn-BD',
  USD: 'en-US',
  EUR: 'en-EU',
  GBP: 'en-GB',
  INR: 'en-IN',
  PKR: 'en-PK',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  AUD: 'en-AU',
  CAD: 'en-CA',
};

export async function TransactionList() {
  noStore(); // Prevent caching to ensure fresh data
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currency: true, locale: true },
  });

  const currency = user?.currency || 'BDT';
  // Use currency's locale for number formatting, not user's language preference
  const locale = CURRENCY_LOCALES[currency] || 'en-US';

  return <TransactionListClient locale={locale} currency={currency} />;
}

