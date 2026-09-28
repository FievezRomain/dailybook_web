import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { contactListSchema, contactSchema, createContactSchema } from '@/features/contacts/schemas/contact';

export async function GET() {
  try {
    return bffSuccess(contactListSchema.parse(await backendApiClient('api/v1/contacts')));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, createContactSchema);
    return bffSuccess(contactSchema.parse(await backendApiClient('api/v1/contacts', 'POST', body)), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
