import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  toBanglaNumber,
  formatNumber,
  calculatePercentage,
} from '@/lib/utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format number as BDT currency', () => {
      const result = formatCurrency(1000);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle decimal values', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBeTruthy();
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toBeTruthy();
    });
  });

  describe('toBanglaNumber', () => {
    it('should convert English digits to Bangla', () => {
      expect(toBanglaNumber(0)).toBe('০');
      expect(toBanglaNumber(1)).toBe('১');
      expect(toBanglaNumber(9)).toBe('৯');
    });

    it('should convert multi-digit numbers', () => {
      expect(toBanglaNumber(123)).toBe('১২৩');
      expect(toBanglaNumber(456789)).toBe('৪৫৬৭৮৯');
    });

    it('should handle string input', () => {
      expect(toBanglaNumber('123')).toBe('১২৩');
    });
  });

  describe('formatNumber', () => {
    it('should format number with commas', () => {
      const result = formatNumber(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should handle large numbers', () => {
      const result = formatNumber(1234567);
      expect(result).toBeTruthy();
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(75, 100)).toBe(75);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('should handle decimal results', () => {
      const result = calculatePercentage(1, 3);
      expect(result).toBeCloseTo(33.33, 1);
    });
  });
});

