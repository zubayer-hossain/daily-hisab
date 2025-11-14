'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

interface SettingsFormProps {
  user: {
    locale: string;
    currency: string;
    theme: string;
  };
}

const CURRENCIES = [
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', locale: 'bn-BD' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'en-EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', locale: 'en-PK' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
];

const LANGUAGES = [
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩', nativeName: 'বাংলা' },
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
];

export function SettingsForm({ user }: SettingsFormProps) {
  const [currency, setCurrency] = useState(user.currency);
  const [locale, setLocale] = useState<'bn' | 'en'>(user.locale as 'bn' | 'en');
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(false);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();

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

  const handleCurrencyChange = async (newCurrency: string) => {
    setIsLoadingCurrency(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency }),
      });

      if (!response.ok) {
        throw new Error('Failed to update currency');
      }

      setCurrency(newCurrency);
      
      toast({
        title: t('category.success'),
        description: t('settings.currencyUpdated'),
      });

      router.refresh();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('settings.failedToUpdateCurrency'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCurrency(false);
    }
  };

  const handleLanguageChange = async (newLocale: 'bn' | 'en') => {
    setIsLoadingLanguage(true);
    try {
      // Set cookie with proper attributes
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      setLocale(newLocale);
      
      // Update user preference in database
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (!response.ok) {
        throw new Error('Failed to update language');
      }

      toast({
        title: newLocale === 'bn' ? 'ভাষা পরিবর্তন করা হয়েছে' : 'Language changed',
        description: newLocale === 'bn' ? 'বাংলা ভাষা নির্বাচন করা হয়েছে' : 'English language selected',
      });

      // Force a full page reload to apply new locale
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to update language',
        variant: 'destructive',
      });
      setIsLoadingLanguage(false);
    }
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency);
  const selectedLanguage = LANGUAGES.find((l) => l.code === locale);

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language')}</CardTitle>
          <CardDescription>
            {t('settings.languageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={locale === lang.code ? 'default' : 'outline'}
                className="h-auto py-4 flex items-center justify-start gap-3"
                onClick={() => handleLanguageChange(lang.code as 'bn' | 'en')}
                disabled={isLoadingLanguage || locale === lang.code}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-semibold">{lang.nativeName}</div>
                  <div className="text-xs text-muted-foreground">{lang.name}</div>
                </div>
                {locale === lang.code && <span className="ml-auto">✓</span>}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.currencySettings')}</CardTitle>
          <CardDescription>
            {t('settings.choosePreferredCurrency')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">{t('settings.currency')}</Label>
            <Select
              value={currency}
              onValueChange={handleCurrencyChange}
              disabled={isLoadingCurrency}
            >
              <SelectTrigger id="currency">
                <SelectValue>
                  {selectedCurrency && (
                    <span>
                      {selectedCurrency.symbol} {selectedCurrency.name} ({selectedCurrency.code})
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{curr.symbol}</span>
                      <span>{curr.name}</span>
                      <span className="text-muted-foreground">({curr.code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('settings.currentLocale')}: {selectedCurrency?.locale}
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">{t('settings.preview')}:</p>
            <div className="space-y-1">
              <p className="text-lg">
                {formatCurrency(1000, selectedCurrency?.locale || 'en-US', currency)}
              </p>
              <p className="text-lg">
                {formatCurrency(50000, selectedCurrency?.locale || 'en-US', currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

