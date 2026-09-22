import { describe, it, expect } from 'vitest';
import { formatPrice, pluralize } from '../utils/format';
import { cn } from '../utils/cn';

describe('Format Utils', () => {
  it('formats price correctly with default currency', () => {
    const formatted = formatPrice(12.5, 'USD');
    expect(formatted).toMatch(/12[.,]50/);
    expect(formatted).toContain('$');
  });

  it('formats pluralize for Russian cases correctly', () => {
    const forms: [string, string, string] = ['товар', 'товара', 'товаров'];
    expect(pluralize(1, forms)).toBe('товар');
    expect(pluralize(2, forms)).toBe('товара');
    expect(pluralize(5, forms)).toBe('товаров');
    expect(pluralize(11, forms)).toBe('товаров');
    expect(pluralize(21, forms)).toBe('товар');
    expect(pluralize(24, forms)).toBe('товара');
    expect(pluralize(25, forms)).toBe('товаров');
  });
});

describe('Classname merge (cn)', () => {
  it('combines classes correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'block')).toBe('base block');
  });
});
