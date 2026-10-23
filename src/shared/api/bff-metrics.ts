import 'server-only';
import axios, { type AxiosResponse } from 'axios';
import { Counter, Histogram, Registry } from '@prometheus-io/client';
import { metricRoute } from './bff-metric-routes';

function createMetrics() {
  const registry = new Registry();
  const labelNames = ['method', 'route', 'outcome'] as const;
  const requests = new Counter({ name: 'vasco_bff_upstream_requests_total', help: 'Backend transport attempts', labelNames, registers: [registry] });
  const duration = new Histogram({ name: 'vasco_bff_upstream_duration_seconds', help: 'Backend transport duration, excluding Firebase authentication',
    labelNames, buckets: [0.005, 0.025, 0.1, 0.25, 0.5, 1, 2, 5, 7.5, 10, 15, 30], registers: [registry] });
  return { registry, requests, duration };
}

const shared = globalThis as typeof globalThis & { __vascoBffMetrics?: ReturnType<typeof createMetrics> };
export const metricsEnabled = () => process.env.BFF_METRICS_ENABLED === 'true';
export const metricsRegistry = () => (shared.__vascoBffMetrics ??= createMetrics()).registry;

export async function measureBackendRequest<T>(path: string, method: string, request: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> {
  if (!metricsEnabled()) return request();
  const started = performance.now();
  let outcome = 'internal_error';
  try {
    const response = await request();
    outcome = response.status >= 500 ? 'http_5xx' : response.status >= 400 ? 'http_4xx' : 'success';
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      outcome = ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code ?? '') ? 'timeout'
        : error.response ? (error.response.status >= 500 ? 'http_5xx' : 'http_4xx') : 'network_error';
    }
    throw error;
  } finally {
    try {
      const metrics = shared.__vascoBffMetrics ??= createMetrics();
      const labels = { method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? method : 'OTHER', route: metricRoute(path), outcome };
      metrics.requests.inc(labels);
      metrics.duration.observe(labels, Math.max(0, performance.now() - started) / 1000);
    } catch {
      // No raw exception: telemetry must neither leak a request nor break it.
      console.warn('BFF_METRICS_OBSERVATION_UNAVAILABLE');
    }
  }
}
