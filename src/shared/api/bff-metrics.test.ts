import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import axios, { AxiosError, type AxiosResponse } from 'axios';
import { Counter } from '@prometheus-io/client';
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'fixture-session' }) }) }));
vi.mock('@/lib/firebase-admin', () => ({ getAdminAuth: () => ({ verifySessionCookie: async () => ({ uid: 'fixture' }) }) }));
vi.mock('./bff-logger', async importOriginal => ({ ...await importOriginal<typeof import('./bff-logger')>(), writeBffLog: vi.fn() }));
import { measureBackendRequest, metricsRegistry } from './bff-metrics';
import { metricRoute } from './bff-metric-routes';
import { backendApiClient, backendApiBinary } from './backend-api-client';
import { GET } from '@/app/api/internal/metrics/route';

const token = 'local-test-metrics-credential-not-a-secret';
const response = (status = 200, data: unknown = { success: true, data: [] }) => ({ status, data, headers: {} }) as AxiosResponse;
beforeEach(() => {
  vi.stubEnv('BFF_METRICS_ENABLED', 'true');
  vi.stubEnv('BFF_METRICS_TOKEN', token);
  vi.stubEnv('VASCO_API_URL', 'https://api.example.invalid');
  metricsRegistry().resetMetrics();
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it.each([
  ['api/v1/events/123?email=private', '/api/v1/events/:id'],
  ['api/v1/events/123/documents/private.jpg', '/api/v1/events/:id/documents/:file'],
  ['api/v1/users/private-email', '__unmatched__'],
  ['api/v1/statistics/private-type', '__unmatched__'],
  ['api/v1/animals/4/history/taille/9', '/api/v1/animals/:id/history/taille/:id'],
])('uses a closed vocabulary for %s', (input, expected) => expect(metricRoute(input)).toBe(expected));

it.each(['ECONNABORTED', 'ETIMEDOUT'])('distinguishes %s from a backend 500 and preserves the error', async code => {
  const error = new AxiosError('private detail', code);
  await expect(measureBackendRequest('api/v1/events', 'GET', async () => { throw error; })).rejects.toBe(error);
  const metrics = await metricsRegistry().metrics();
  expect(metrics).toContain('outcome="timeout"');
  expect(metrics).not.toContain('private detail');
});

it('records a backend 500 separately from a network failure', async () => {
  const server = new AxiosError('private', 'ERR_BAD_RESPONSE', undefined, undefined, response(500));
  const network = new AxiosError('private', 'ECONNRESET');
  for (const error of [server, network]) {
    await expect(measureBackendRequest('api/v1/events', 'GET', async () => { throw error; })).rejects.toBe(error);
  }
  const metrics = await metricsRegistry().metrics();
  expect(metrics).toContain('outcome="http_5xx"');
  expect(metrics).toContain('outcome="network_error"');
});

it('instruments both actual backend helpers without modifying their timeouts', async () => {
  const fetcher = vi.spyOn(axios, 'request').mockResolvedValueOnce(response()).mockResolvedValueOnce(response(200, new ArrayBuffer(0)));
  await backendApiClient('api/v1/events');
  await backendApiBinary('api/v1/animals/4/medical-record');
  expect(fetcher).toHaveBeenNthCalledWith(1, expect.objectContaining({ timeout: 10_000 }));
  expect(fetcher).toHaveBeenNthCalledWith(2, expect.objectContaining({ timeout: 30_000 }));
  const metrics = await metricsRegistry().metrics();
  expect(metrics).toContain('/api/v1/animals/:id/medical-record');
  expect(metrics).not.toContain('fixture-session');
});

it('disables collection and export by default', async () => {
  vi.stubEnv('BFF_METRICS_ENABLED', 'false');
  const request = vi.fn().mockResolvedValue(response());
  await measureBackendRequest('api/v1/events', 'GET', request);
  expect(request).toHaveBeenCalledOnce();
  expect((await GET(new Request('http://localhost/api/internal/metrics'))).status).toBe(404);
});

it('preserves a successful response when observation fails', async () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const counter = metricsRegistry().getSingleMetric('vasco_bff_upstream_requests_total') as Counter;
  vi.spyOn(counter, 'inc').mockImplementation(() => { throw new Error('private observation failure'); });
  const result = response();
  await expect(measureBackendRequest('api/v1/events', 'GET', async () => result)).resolves.toBe(result);
  expect(warning).toHaveBeenCalledWith('BFF_METRICS_OBSERVATION_UNAVAILABLE');
});

it('protects export and refuses weak configuration', async () => {
  const url = 'http://localhost/api/internal/metrics';
  expect((await GET(new Request(url))).status).toBe(401);
  expect((await GET(new Request(url, { headers: { Authorization: 'Bearer wrong' } }))).status).toBe(401);
  const accepted = await GET(new Request(url, { headers: { Authorization: `Bearer ${token}` } }));
  expect(accepted.status).toBe(200);
  expect(accepted.headers.get('cache-control')).toBe('no-store');
  expect(await accepted.text()).not.toContain(token);
  vi.stubEnv('BFF_METRICS_TOKEN', '');
  expect((await GET(new Request(url))).status).toBe(503);
});
