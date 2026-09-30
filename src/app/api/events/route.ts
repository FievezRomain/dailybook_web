import { backendApiClient } from '@/shared/api/backend-api-client';
import { WebApiError } from '@/shared/api/api-error';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { createEventSchema, eventListQuerySchema, eventListSchema } from '@/features/events/schemas/event';

const allowedEventQueryKeys = new Set([
  'date_from', 'date_to', 'animal_ids', 'event_types', 'states',
  'include_overdue_open', 'limit', 'offset',
]);

export async function GET(request = new Request('http://localhost/api/events')) {
  try {
    const source = new URL(request.url).searchParams;
    for (const key of source.keys()) {
      if (!allowedEventQueryKeys.has(key)) {
        throw new WebApiError({
          code: 'VALIDATION_ERROR', message: `Paramètre de filtre inconnu: ${key}`, status: 422,
        });
      }
    }
    const query = eventListQuerySchema.parse({
      date_from: source.get('date_from') ?? undefined,
      date_to: source.get('date_to') ?? undefined,
      animal_ids: source.getAll('animal_ids'),
      event_types: source.getAll('event_types'),
      states: source.getAll('states'),
      include_overdue_open: source.get('include_overdue_open') ?? 'false',
      limit: source.get('limit') ?? undefined,
      offset: source.get('offset') ?? '0',
    });
    const upstream = new URLSearchParams();
    if (query.date_from) upstream.set('date_from', query.date_from);
    if (query.date_to) upstream.set('date_to', query.date_to);
    query.animal_ids.forEach((id) => upstream.append('animal_ids', String(id)));
    query.event_types.forEach((type) => upstream.append('event_types', type));
    query.states.forEach((state) => upstream.append('states', state));
    if (query.include_overdue_open) upstream.set('include_overdue_open', 'true');
    if (query.limit) upstream.set('limit', String(query.limit));
    if (query.offset) upstream.set('offset', String(query.offset));
    const suffix = upstream.size ? `?${upstream}` : '';
    return bffSuccess(eventListSchema.parse(await backendApiClient(`api/v1/events${suffix}`)));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, createEventSchema);
    return bffSuccess(eventListSchema.parse(await backendApiClient('api/v1/events', 'POST', body)), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
