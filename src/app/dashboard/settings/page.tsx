import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/supabase';
import { SettingsForm } from '@/components/settings/settings-form';
import { getTranslations } from 'next-intl/server';

export default async function SettingsPage() {
  const session = await auth();
  const t = await getTranslations();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch full user data including preferences
  const user = await db.getUser(session.user.id);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('settings.description')}
        </p>
      </div>

      <SettingsForm user={{
        locale: user.locale,
        currency: user.currency,
        theme: user.theme,
      }} />
    </div>
  );
}

