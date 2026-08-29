import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { createWishSchema, wishListSchema, wishSchema } from '@/features/wishes/schemas/wish';

export async function GET() {
  try {
    return bffSuccess(wishListSchema.parse(await backendApiClient('api/v1/wishes')));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, createWishSchema);
    return bffSuccess(wishSchema.parse(await backendApiClient('api/v1/wishes', 'POST', body)), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
