import { describe, expect, it } from 'vitest';
import { WebApiError } from '@/shared/api/api-error';
import { isPremiumRequiredError } from './premium-error';

describe('isPremiumRequiredError', () => {
  it('reconnaît uniquement le code backend Premium', () => {
    expect(isPremiumRequiredError(new WebApiError({ code: 'PREMIUM_REQUIRED', message: 'Premium requis', status: 403 }))).toBe(true);
    expect(isPremiumRequiredError(new WebApiError({ code: 'FORBIDDEN', message: 'Interdit', status: 403 }))).toBe(false);
    expect(isPremiumRequiredError(new Error('Premium requis'))).toBe(false);
  });
});
