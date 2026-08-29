import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { backendUploadTicketSchema, resolveUploadFileResource, uploadRequestSchema } from '@/shared/api/file-contract';
import { validatePresignedUrl } from '@/shared/security/presigned-url';

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, uploadRequestSchema);
    const resource = await resolveUploadFileResource(body.resourceType, body.resourceId);
    const ticket = backendUploadTicketSchema.parse(await backendApiClient('api/v1/files/upload-url', 'POST', {
      filename: body.filename, contentType: body.contentType, sizeBytes: body.sizeBytes, ...resource,
    }));
    return bffSuccess({ ...ticket, url: validatePresignedUrl(ticket.url) });
  } catch (error) {
    return bffError(error);
  }
}
