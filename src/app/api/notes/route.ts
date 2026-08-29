import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { createNoteSchema, noteListSchema, noteSchema } from '@/features/notes/schemas/note';

export async function GET() {
  try {
    return bffSuccess(noteListSchema.parse(await backendApiClient('api/v1/notes')));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, createNoteSchema);
    return bffSuccess(noteSchema.parse(await backendApiClient('api/v1/notes', 'POST', body)), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
