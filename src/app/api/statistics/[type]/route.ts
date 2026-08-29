import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import {
  statisticsQuerySchema,
  statisticsResponseSchemas,
  statisticsTypeSchema,
} from '@/features/statistics/schemas/statistics';

type RouteContext = { params: Promise<{ type: string }> };

export async function POST(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const type = statisticsTypeSchema.parse((await context.params).type);
    const body = await parseJson(request, statisticsQuerySchema);
    const data = await backendApiClient(`api/v1/statistics/${type}`, 'POST', body);
    return bffSuccess(statisticsResponseSchemas[type].parse(data));
  } catch (error) {
    return bffError(error);
  }
}
