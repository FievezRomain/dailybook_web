import { timingSafeEqual } from 'node:crypto';
import { metricsEnabled, metricsRegistry } from '@/shared/api/bff-metrics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const headers = { 'Cache-Control': 'no-store' };
  if (!metricsEnabled()) return new Response(null, { status: 404, headers });
  const token = process.env.BFF_METRICS_TOKEN ?? '';
  if (token.length < 32 || token !== token.trim()) return new Response(null, { status: 503, headers });
  const expected = Buffer.from(`Bearer ${token}`);
  const provided = Buffer.from(request.headers.get('authorization') ?? '');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return new Response(null, { status: 401, headers });
  }
  const registry = metricsRegistry();
  return new Response(await registry.metrics(), { headers: { ...headers, 'Content-Type': registry.contentType } });
}
