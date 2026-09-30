import { z } from 'zod';
import { storedFilenameSchema } from '@/shared/schemas/file';

export const fileResourceTypeSchema = z.enum(['animal', 'body', 'event', 'wish', 'user']);

export const fileDownloadRequestSchema = z.object({
  fileName: storedFilenameSchema,
  resourceType: fileResourceTypeSchema,
  resourceId: z.number().int().positive(),
}).strict();

export const fileDownloadBatchRequestSchema = z.object({
  items: z.array(fileDownloadRequestSchema).min(1).max(100),
}).strict();

export const backendFileDownloadBatchResponseSchema = z.array(z.object({
  fileName: storedFilenameSchema,
  ressourceType: fileResourceTypeSchema,
  ressourceId: z.number().int().positive(),
  url: z.unknown().nullable(),
}));

export type FileDownloadRequest = z.infer<typeof fileDownloadRequestSchema>;

export function fileDownloadKey(item: FileDownloadRequest): string {
  return `${item.resourceType}:${item.resourceId}:${item.fileName}`;
}
