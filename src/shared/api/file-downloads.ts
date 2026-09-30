'use client';

import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { webApiClient } from './web-api-client';
import {
  backendFileDownloadBatchResponseSchema,
  fileDownloadBatchRequestSchema,
  fileDownloadKey,
  type FileDownloadRequest,
} from './file-download-contract';

export async function getFileDownloadUrls(items: FileDownloadRequest[]): Promise<Map<string, string>> {
  if (!items.length) return new Map();
  const body = fileDownloadBatchRequestSchema.parse({ items });
  const response = await webApiClient.post('/files/download-urls', body);
  const results = backendFileDownloadBatchResponseSchema.parse(response.data);
  return new Map(results.flatMap((item) => {
    if (!item.url) return [];
    const request = {
      fileName: item.fileName,
      resourceType: item.ressourceType,
      resourceId: item.ressourceId,
    } satisfies FileDownloadRequest;
    return [[fileDownloadKey(request), validatePresignedUrl(item.url)] as const];
  }));
}
