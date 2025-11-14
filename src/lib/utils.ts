import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount with symbol after the number
 */
export function formatCurrency(
  amount: number,
  locale: string = 'bn-BD',
  currency: string = 'BDT'
): string {
  // Format the number without currency symbol
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Currency symbols mapping
  const currencySymbols: Record<string, string> = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    PKR: '₨',
    JPY: '¥',
    CNY: '¥',
    AUD: '$',
    CAD: '$',
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Return with symbol after the amount
  return `${formattedNumber} ${symbol}`;
}

/**
 * Format number to Bangla numerals
 */
export function toBanglaNumber(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((digit) => {
      if (/\d/.test(digit)) {
        return banglaDigits[parseInt(digit)];
      }
      return digit;
    })
    .join('');
}

/**
 * Format number with commas
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format date
 */
export function formatDate(
  date: Date | string,
  locale: string = 'bn-BD',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
}

/**
 * Format time
 */
export function formatTime(
  date: Date | string,
  locale: string = 'bn-BD',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
}

/**
 * Get month name
 */
export function getMonthName(monthIndex: number, locale: string = 'bn-BD'): string {
  const date = new Date(2024, monthIndex, 1);
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
}

/**
 * Get day name
 */
export function getDayName(date: Date, locale: string = 'bn-BD'): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

