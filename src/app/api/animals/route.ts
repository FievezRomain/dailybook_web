import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { animalListSchema, animalSchema, createAnimalSchema } from '@/features/animals/schemas/animal';

export async function GET() {
  try {
    return bffSuccess(animalListSchema.parse(await backendApiClient('api/v1/animals')));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, createAnimalSchema);
    return bffSuccess(animalSchema.parse(await backendApiClient('api/v1/animals', 'POST', body)), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
