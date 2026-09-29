import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { resolveUploadFileResource, uploadCompleteSchema } from '@/shared/api/file-contract';

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, uploadCompleteSchema);
    const resource = await resolveUploadFileResource(body.resourceType, body.resourceId);
    return bffSuccess(await backendApiClient('api/v1/files/upload-complete', 'POST', {
      filename: body.filename, contentType: body.contentType, ...resource,
    }));
  } catch (error) {
    return bffError(error);
  }
}
