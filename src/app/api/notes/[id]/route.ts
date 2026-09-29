import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent, bffSuccess } from '@/shared/api/bff-response';
import { noteIdSchema, noteSchema, updateNoteSchema } from '@/features/notes/schemas/note';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = noteIdSchema.parse((await context.params).id);
    const body = await parseJson(request, updateNoteSchema);
    return bffSuccess(noteSchema.parse(await backendApiClient(`api/v1/notes/${id}`, 'PUT', { ...body, id })));
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = noteIdSchema.parse((await context.params).id);
    await backendApiClient(`api/v1/notes/${id}`, 'DELETE');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
