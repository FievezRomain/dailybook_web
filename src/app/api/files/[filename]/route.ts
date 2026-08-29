import { backendApiClient } from '@/shared/api/backend-api-client';
import { validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent, bffSuccess } from '@/shared/api/bff-response';
import {
  backendDownloadUrlSchema, fileDeleteQuerySchema, fileQuerySchema,
  resolveDeleteFileResource, resolveFileResource,
} from '@/shared/api/file-contract';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { storedFilenameSchema } from '@/shared/schemas/file';

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const parsedQuery = fileQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const filename = storedFilenameSchema.parse(decodeURIComponent((await context.params).filename));
    const resource = await resolveFileResource(parsedQuery.resourceType, parsedQuery.resourceId);
    const query = new URLSearchParams({ ressourceType: resource.ressourceType, ressourceId: String(resource.ressourceId) });
    const result = backendDownloadUrlSchema.parse(
      await backendApiClient(`api/v1/files/${encodeURIComponent(filename)}?${query}`),
    );
    return bffSuccess({ ...result, url: validatePresignedUrl(result.url) });
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const parsedQuery = fileDeleteQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const filename = storedFilenameSchema.parse(decodeURIComponent((await context.params).filename));
    const resource = await resolveDeleteFileResource(parsedQuery.resourceType, parsedQuery.resourceId);
    const query = new URLSearchParams({ ressourceType: resource.ressourceType });
    if (resource.ressourceId) query.set('ressourceId', String(resource.ressourceId));
    await backendApiClient(`api/v1/files/${encodeURIComponent(filename)}?${query}`, 'DELETE');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
