'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<'bn' | 'en'>('bn');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Get locale from cookie
    const cookieLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as 'bn' | 'en' | undefined;
    
    if (cookieLocale && (cookieLocale === 'bn' || cookieLocale === 'en')) {
      setLocale(cookieLocale);
    }
  }, []);

  const changeLanguage = async (newLocale: 'bn' | 'en') => {
    // Set cookie with proper attributes
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`; // 1 year
    setLocale(newLocale);
    
    // Update user preference in database
    try {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      });
    } catch (error) {
      console.error('Failed to update locale preference:', error);
    }

    toast({
      title: newLocale === 'bn' ? 'ভাষা পরিবর্তন করা হয়েছে' : 'Language changed',
      description: newLocale === 'bn' ? 'বাংলা ভাষা নির্বাচন করা হয়েছে' : 'Bengali language selected',
    });

    // Force a full page reload to apply new locale from cookie
    // This ensures server components re-read the cookie
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage('bn')}
          className={locale === 'bn' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇧🇩</span>
          <span>বাংলা</span>
          {locale === 'bn' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇬🇧</span>
          <span>English</span>
          {locale === 'en' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

