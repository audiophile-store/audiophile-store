import { describe, expect, it } from 'vitest';
import { formatCurrency } from './utils';

describe('euro price formatting', () => {
  it('treats the service price as euros, not cents', () => {
    expect(formatCurrency(123.45)).toBe('123,45\u00a0\u20ac');
  });
});
