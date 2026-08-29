import 'server-only';
import { z } from 'zod';
import { backendApiClient } from './backend-api-client';

export const imageContentTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp']);
export const uploadContentTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
export const generatedImageFilenameSchema = z.string().regex(/^[a-f0-9]{32}\.(?:jpg|png|webp)$/);
export const generatedFileFilenameSchema = z.string().regex(/^[a-f0-9]{32}\.(?:jpg|png|webp|pdf)$/);
export const fileResourceSchema = z.enum(['animal', 'body', 'event', 'wish']);
export const uploadRequestSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: uploadContentTypeSchema,
  sizeBytes: z.number().int().min(1).max(3 * 1024 * 1024),
  resourceType: fileResourceSchema.optional(),
  resourceId: z.number().int().positive().optional(),
}).strict().superRefine((value, context) => {
  if (value.resourceType !== 'event' && ((value.resourceType === undefined) !== (value.resourceId === undefined))) {
    context.addIssue({ code: 'custom', message: 'Le type et l’identifiant de ressource sont requis ensemble.' });
  }
  if (value.resourceType === undefined && value.contentType === 'application/pdf') context.addIssue({ code: 'custom', message: 'Format interdit.' });
  if (value.resourceType !== 'event' && value.contentType === 'application/pdf') context.addIssue({ code: 'custom', message: 'Format interdit.' });
  if (value.resourceType === 'event' && value.contentType === 'image/webp') context.addIssue({ code: 'custom', message: 'Format interdit.' });
  const limit = value.resourceType === 'body'
    ? 1024 * 1024
    : value.resourceType === 'event'
      ? 3 * 1024 * 1024
      : value.resourceType === 'wish'
        ? 750 * 1024
        : 500 * 1024;
  if (value.sizeBytes > limit) context.addIssue({ code: 'custom', message: 'Fichier trop volumineux.' });
});
export const uploadCompleteSchema = z.object({
  filename: generatedFileFilenameSchema,
  contentType: uploadContentTypeSchema,
  resourceType: fileResourceSchema.optional(),
  resourceId: z.number().int().positive().optional(),
}).strict().superRefine((value, context) => {
  if (value.resourceType !== 'event' && ((value.resourceType === undefined) !== (value.resourceId === undefined))) {
    context.addIssue({ code: 'custom', message: 'Le type et l’identifiant de ressource sont requis ensemble.' });
  }
  if (value.resourceType === undefined && value.contentType === 'application/pdf') context.addIssue({ code: 'custom', message: 'Format interdit.' });
  if (value.resourceType !== 'event' && value.contentType === 'application/pdf') context.addIssue({ code: 'custom', message: 'Format interdit.' });
  if (value.resourceType === 'event' && value.contentType === 'image/webp') context.addIssue({ code: 'custom', message: 'Format interdit.' });
});
export const fileQuerySchema = z.object({
  resourceType: fileResourceSchema.optional(),
  resourceId: z.coerce.number().int().positive().optional(),
}).strict().superRefine((value, context) => {
  if ((value.resourceType === undefined) !== (value.resourceId === undefined)) {
    context.addIssue({ code: 'custom', message: 'Le type et l’identifiant de ressource sont requis ensemble.' });
  }
});
export const fileDeleteQuerySchema = z.object({
  resourceType: fileResourceSchema.optional(),
  resourceId: z.coerce.number().int().positive().optional(),
}).strict().superRefine((value, context) => {
  if (value.resourceType !== 'event' && ((value.resourceType === undefined) !== (value.resourceId === undefined))) {
    context.addIssue({ code: 'custom', message: 'Le type et l’identifiant de ressource sont requis ensemble.' });
  }
});
export const backendUploadTicketSchema = z.object({
  url: z.unknown(), fields: z.record(z.string(), z.string()), filename: generatedFileFilenameSchema,
  expiresIn: z.number().int().positive().optional(),
}).passthrough();
export const backendDownloadUrlSchema = z.object({ url: z.unknown() }).passthrough();
const backendUserIdSchema = z.object({ id: z.number().int().positive() });

export async function resolveUploadFileResource(resourceType?: 'animal' | 'body' | 'event' | 'wish', resourceId?: number) {
  if (resourceType === 'event') return { ressourceType: 'event' as const, ressourceId: resourceId };
  if (resourceType && resourceId) return { ressourceType: resourceType, ressourceId: resourceId };
  const userId = backendUserIdSchema.parse(await backendApiClient('api/v1/users/me')).id;
  return { ressourceType: 'user' as const, ressourceId: userId };
}

export async function resolveFileResource(resourceType?: 'animal' | 'body' | 'event' | 'wish', resourceId?: number) {
  if (resourceType && resourceId) return { ressourceType: resourceType, ressourceId: resourceId };
  const userId = backendUserIdSchema.parse(await backendApiClient('api/v1/users/me')).id;
  return { ressourceType: 'user' as const, ressourceId: userId };
}

export async function resolveDeleteFileResource(resourceType?: 'animal' | 'body' | 'event' | 'wish', resourceId?: number) {
  if (resourceType === 'event') return { ressourceType: 'event' as const, ressourceId: resourceId };
  return resolveFileResource(resourceType, resourceId);
}
