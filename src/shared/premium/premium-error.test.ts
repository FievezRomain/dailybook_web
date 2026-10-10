import { describe, expect, it } from 'vitest';
import { WebApiError } from '@/shared/api/api-error';
import { isAnimalQuotaExceededError, isPremiumRequiredError } from './premium-error';

describe('isPremiumRequiredError', () => {
  it('reconnaît uniquement le code backend Premium', () => {
    expect(isPremiumRequiredError(new WebApiError({ code: 'PREMIUM_REQUIRED', message: 'Premium requis', status: 403 }))).toBe(true);
    expect(isPremiumRequiredError(new WebApiError({ code: 'FORBIDDEN', message: 'Interdit', status: 403 }))).toBe(false);
    expect(isPremiumRequiredError(new Error('Premium requis'))).toBe(false);
  });
});

describe('isAnimalQuotaExceededError', () => {
  it('reconnaît uniquement le quota renvoyé par FastAPI', () => {
    expect(isAnimalQuotaExceededError(new WebApiError({ code: 'QUOTA_EXCEEDED', message: 'Limite atteinte', status: 429 }))).toBe(true);
    expect(isAnimalQuotaExceededError(new WebApiError({ code: 'FEATURE_UNAVAILABLE', message: 'Premium requis', status: 403 }))).toBe(false);
  });
});
