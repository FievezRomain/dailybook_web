import { backendApiClient } from '@/shared/api/backend-api-client';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import {
  animalHistoryItemSchema, animalHistoryListSchema, backendAnimalHistoryListSchema, positiveIdSchema,
} from '@/features/animals/schemas/animal';

type RouteContext = { params: Promise<{ id: string; item: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const id = positiveIdSchema.parse(params.id);
    const item = animalHistoryItemSchema.parse(params.item);
    const rows = backendAnimalHistoryListSchema.parse(
      await backendApiClient(`api/v1/animals/${id}/history/${item}`),
    );
    return bffSuccess(animalHistoryListSchema.parse(rows.map((row) => ({ ...row, item }))));
  } catch (error) {
    return bffError(error);
  }
}
