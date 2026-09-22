import { format, formatDistanceToNow } from 'date-fns';
import { ru, uz, enUS } from 'date-fns/locale';

const locales: Record<string, Locale> = { ru, uz, en: enUS };

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date, fmt: string = 'PP', lang: string = 'ru'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt, { locale: locales[lang] || ru });
}

export function formatRelativeDate(date: string | Date, lang: string = 'ru'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: locales[lang] || ru });
}

export function pluralize(count: number, forms: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return forms[
    count % 100 > 4 && count % 100 < 20
      ? 2
      : cases[Math.min(count % 10, 5)]
  ];
}
