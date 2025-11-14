import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'bn'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'bn';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from cookie or use default
  let locale: Locale = defaultLocale;
  
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
    if (cookieLocale && (cookieLocale === 'en' || cookieLocale === 'bn')) {
      locale = cookieLocale as Locale;
    }
  } catch (error) {
    // If cookies() fails, use default locale
    console.warn('Failed to read locale from cookie:', error);
  }

  // Use requestLocale if provided (from next-intl routing), otherwise use cookie/default
  const resolvedRequestLocale = await requestLocale;
  const finalLocale: Locale = (resolvedRequestLocale as Locale) || locale;

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default,
  };
});

