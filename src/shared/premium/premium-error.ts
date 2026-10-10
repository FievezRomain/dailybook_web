import { WebApiError } from '@/shared/api/api-error';

export function isPremiumRequiredError(error: unknown): error is WebApiError {
  return error instanceof WebApiError && error.code === 'PREMIUM_REQUIRED';
}

export function isAnimalQuotaExceededError(error: unknown): error is WebApiError {
  return error instanceof WebApiError && error.code === 'QUOTA_EXCEEDED';
}
