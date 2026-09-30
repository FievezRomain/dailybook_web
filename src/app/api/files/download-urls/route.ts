import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import {
  backendFileDownloadBatchResponseSchema,
  fileDownloadBatchRequestSchema,
} from '@/shared/api/file-download-contract';
import { validatePresignedUrl } from '@/shared/security/presigned-url';

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, fileDownloadBatchRequestSchema);
    const result = backendFileDownloadBatchResponseSchema.parse(
      await backendApiClient('api/v1/files/download-urls', 'POST', {
        items: body.items.map((item) => ({
          fileName: item.fileName,
          ressourceType: item.resourceType,
          ressourceId: item.resourceId,
        })),
      }),
    );
    return bffSuccess(result.map((item) => ({
      ...item,
      url: item.url ? validatePresignedUrl(item.url) : null,
    })));
  } catch (error) {
    return bffError(error);
  }
}
