import { backendApiClient } from '@/shared/api/backend-api-client';
import { validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent, bffSuccess } from '@/shared/api/bff-response';
import { eventFileNameSchema, eventIdSchema } from '@/features/events/schemas/event';
import { backendDownloadUrlSchema } from '@/shared/api/file-contract';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { storedFilenameSchema } from '@/shared/schemas/file';

type RouteContext = { params: Promise<{ id: string; filename: string }> };

async function params(context: RouteContext) {
  const value = await context.params;
  return { id: eventIdSchema.parse(value.id), filename: storedFilenameSchema.parse(decodeURIComponent(value.filename)) };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id, filename } = await params(context);
    const result = backendDownloadUrlSchema.parse(
      await backendApiClient(`api/v1/events/${id}/documents/${encodeURIComponent(filename)}`),
    );
    return bffSuccess({ ...result, url: validatePresignedUrl(result.url) });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const { id, filename } = await params(context);
    const generatedFilename = eventFileNameSchema.parse(filename);
    await backendApiClient(`api/v1/events/${id}/documents/${encodeURIComponent(generatedFilename)}`, 'POST');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const { id, filename } = await params(context);
    await backendApiClient(`api/v1/events/${id}/documents/${encodeURIComponent(filename)}`, 'DELETE');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
