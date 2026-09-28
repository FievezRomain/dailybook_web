import { WebApiError } from '@/shared/api/api-error';

export function isPremiumRequiredError(error: unknown): error is WebApiError {
  return error instanceof WebApiError && error.code === 'PREMIUM_REQUIRED';
}
