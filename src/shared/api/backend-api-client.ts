import 'server-only';

import { randomUUID } from 'node:crypto';
import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/constants/cookies';
import { adminAuth } from '@/lib/firebase-admin';
import { WebApiError } from './api-error';
import { resolveBackendApiUrl } from './backend-url';

export type BackendApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type BackendBinaryResponse = {
  body: ArrayBuffer;
  contentType: string;
  contentDisposition?: string;
};

interface BackendSuccessEnvelope<T> {
  success: true;
  data: T;
  meta: unknown;
}

interface BackendErrorEnvelope {
  success: false;
  error: { code?: string; message?: string; details?: BackendErrorDetail[] };
  meta?: unknown;
}

interface BackendErrorDetail {
  loc?: Array<string | number>;
  msg?: string;
  field?: string;
  message?: string;
}

export async function backendApiClient<T = unknown>(
  path: string,
  method: BackendApiMethod = 'GET',
  data?: unknown,
): Promise<T> {
  const requestId = randomUUID();
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    throw new WebApiError({
      code: 'UNAUTHENTICATED', message: 'Authentification requise.', status: 401, requestId,
    });
  }

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    throw new WebApiError({
      code: 'UNAUTHENTICATED', message: 'Votre session est invalide ou expirée.', status: 401, requestId,
    });
  }

  const apiUrl = resolveBackendApiUrl(process.env.VASCO_API_URL, requestId);

  try {
    const response = await axios.request<BackendSuccessEnvelope<T>>({
      url: `${apiUrl}/${path.replace(/^\/+/, '')}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': sessionCookie,
        'x-client': 'web',
        'x-request-id': requestId,
      },
      data,
      timeout: 10_000,
      maxContentLength: 2_000_000,
      maxBodyLength: 2_000_000,
    });
    return unwrapEnvelope(response.data);
  } catch (error) {
    throw normalizeBackendError(error, requestId);
  }
}

export async function backendApiBinary(path: string): Promise<BackendBinaryResponse> {
  const { requestId, apiUrl, sessionCookie } = await backendRequestContext();
  try {
    const response = await axios.request<ArrayBuffer>({
      url: `${apiUrl}/${path.replace(/^\/+/, '')}`,
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
        'x-access-token': sessionCookie,
        'x-client': 'web',
        'x-request-id': requestId,
      },
      responseType: 'arraybuffer',
      timeout: 30_000,
      maxContentLength: 35 * 1024 * 1024,
      maxBodyLength: 35 * 1024 * 1024,
    });
    return {
      body: response.data,
      contentType: String(response.headers['content-type'] ?? 'application/octet-stream'),
      contentDisposition: typeof response.headers['content-disposition'] === 'string'
        ? response.headers['content-disposition']
        : undefined,
    };
  } catch (error) {
    throw normalizeBackendError(error, requestId);
  }
}

async function backendRequestContext() {
  const requestId = randomUUID();
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    throw new WebApiError({
      code: 'UNAUTHENTICATED', message: 'Authentification requise.', status: 401, requestId,
    });
  }
  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    throw new WebApiError({
      code: 'UNAUTHENTICATED', message: 'Votre session est invalide ou expirée.', status: 401, requestId,
    });
  }
  const apiUrl = resolveBackendApiUrl(process.env.VASCO_API_URL, requestId);
  return { requestId, sessionCookie, apiUrl };
}

function unwrapEnvelope<T>(body: BackendSuccessEnvelope<T>): T {
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    (body as { success?: unknown }).success === true &&
    'data' in body
  ) {
    return body.data;
  }
  throw new WebApiError({
    code: 'BACKEND_CONTRACT_ERROR',
    message: 'La réponse du service Vasco ne respecte pas le contrat attendu.',
    status: 502,
  });
}

function normalizeBackendError(error: unknown, requestId: string): WebApiError {
  if (error instanceof WebApiError) return error;
  if (!axios.isAxiosError(error)) {
    return new WebApiError({
      code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue.', status: 500, requestId,
    });
  }

  const axiosError = error as AxiosError<BackendErrorEnvelope>;
  const status = axiosError.response?.status ?? 502;
  const body = axiosError.response?.data;
  if (status === 422) {
    console.error(JSON.stringify({
      event: 'backend_contract_rejected',
      requestId,
      code: body?.error?.code ?? 'VALIDATION_ERROR',
      fields: body?.error?.details?.map((detail) =>
        detail.field ?? detail.loc?.filter((part) => part !== 'body').join('.'),
      ).filter(Boolean),
    }));
  }
  return new WebApiError({
    code: body?.error?.code ?? statusToCode(status),
    message: publicMessage(status, body?.error?.message),
    status,
    fieldErrors: toFieldErrors(body?.error?.details),
    requestId,
  });
}

function toFieldErrors(details?: BackendErrorDetail[]): Record<string, string[]> | undefined {
  if (!details?.length) return undefined;
  const result: Record<string, string[]> = {};
  for (const detail of details) {
    const field = detail.field ?? detail.loc?.filter((part) => part !== 'body').join('.');
    const message = detail.message ?? detail.msg;
    if (!field || !message) continue;
    (result[field] ??= []).push(message);
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function statusToCode(status: number): string {
  if (status === 401) return 'UNAUTHENTICATED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422) return 'VALIDATION_ERROR';
  return status >= 500 ? 'BACKEND_UNAVAILABLE' : 'BAD_REQUEST';
}

function publicMessage(status: number, detail?: string): string {
  if (status === 401) return 'Votre session est invalide ou expirée.';
  if (status === 403) return detail || 'Vous ne pouvez pas effectuer cette action.';
  if (status === 404) return 'La ressource demandée est introuvable.';
  if (status === 409 || status === 422) return detail || 'Les données envoyées sont invalides.';
  if (status >= 500) return 'Le service Vasco est temporairement indisponible.';
  return detail || 'La requête ne peut pas être traitée.';
}
