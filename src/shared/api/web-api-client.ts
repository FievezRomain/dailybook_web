import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { WebApiError, type WebApiErrorPayload } from './api-error';

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);
const CSRF_COOKIE_NAME = 'vasco-csrf';

export const webApiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true,
});

let csrfRequest: Promise<string> | undefined;

webApiClient.interceptors.request.use(async (config) => {
  if (config.method && MUTATION_METHODS.has(config.method.toLowerCase())) {
    const csrfToken = readCookie(CSRF_COOKIE_NAME) ?? await fetchCsrfToken();
    config.headers.set('x-csrf-token', csrfToken);
  }
  return config;
});

webApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<WebApiErrorPayload>) => {
    const payload = error.response?.data;
    throw new WebApiError({
      code: payload?.code ?? 'NETWORK_ERROR',
      message: payload?.message ?? 'Le service Vasco est temporairement indisponible.',
      status: payload?.status ?? error.response?.status ?? 503,
      fieldErrors: payload?.fieldErrors,
      requestId: payload?.requestId,
    });
  },
);

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split('; ').find((value) => value.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : undefined;
}

async function fetchCsrfToken(): Promise<string> {
  csrfRequest ??= fetch('/api/security/csrf', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('Unable to initialize CSRF protection');
      const body: unknown = await response.json();
      if (!body || typeof body !== 'object' || typeof (body as Record<string, unknown>).csrfToken !== 'string') {
        throw new Error('Invalid CSRF response');
      }
      return (body as { csrfToken: string }).csrfToken;
    })
    .finally(() => {
      csrfRequest = undefined;
    });
  return csrfRequest;
}

export type WebApiRequestConfig = InternalAxiosRequestConfig;

export default webApiClient;
