import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebApiError } from '@/shared/api/api-error';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { POST } from './route';

const query = { animaux: [2], dateDebut: '2026-08-01', dateFin: '2026-08-31' };

function request(body: unknown, csrf = true) {
  return new Request('http://localhost/api/statistics/poids', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      ...(csrf ? { cookie: 'vasco-csrf=t', 'x-csrf-token': 't' } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe('/api/statistics/[type]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide et relaie une statistique physique Premium', async () => {
    const data = {
      statistic: { labels: ['', '12'], datasets: [{ data: [450, 455] }] },
      history: [{ id: 1, idanimal: 2, date: '2026-08-12', value: 455 }],
    };
    backendApiClient.mockResolvedValue(data);
    const response = await POST(request(query), { params: Promise.resolve({ type: 'poids' }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(data);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/statistics/poids', 'POST', query);
  });

  it('accepte la forme agrégée des statistiques événementielles', async () => {
    backendApiClient.mockResolvedValue({ statistic: [{ date: '2026-08-12', count: 2, exact_value: 1, events: [] }] });
    expect((await POST(request(query), { params: Promise.resolve({ type: 'balades' }) })).status).toBe(200);
  });

  it('refuse un type qui ne figure pas dans la liste FastAPI', async () => {
    expect((await POST(request(query), { params: Promise.resolve({ type: 'revenus' }) })).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });

  it('refuse une période inversée, une date impossible et une liste vide', async () => {
    const context = { params: Promise.resolve({ type: 'depenses' }) };
    expect((await POST(request({ ...query, dateDebut: '2026-09-01' }), context)).status).toBe(422);
    expect((await POST(request({ ...query, dateDebut: '2026-02-31' }), context)).status).toBe(422);
    expect((await POST(request({ ...query, animaux: [] }), context)).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });

  it('refuse la requête sans CSRF', async () => {
    expect((await POST(request(query, false), { params: Promise.resolve({ type: 'poids' }) })).status).toBe(403);
    expect(backendApiClient).not.toHaveBeenCalled();
  });

  it('préserve le refus Premium du backend', async () => {
    backendApiClient.mockRejectedValue(new WebApiError({
      code: 'PREMIUM_REQUIRED',
      message: 'Cette fonctionnalité nécessite Vasco Premium.',
      status: 403,
    }));
    const response = await POST(request(query), { params: Promise.resolve({ type: 'poids' }) });
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'PREMIUM_REQUIRED', status: 403 });
  });
});
