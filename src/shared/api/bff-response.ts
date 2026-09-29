import 'server-only';

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { WebApiError, type WebApiErrorPayload } from './api-error';

export function bffSuccess<T>(data: T, init?: ResponseInit, requestId = randomUUID()): NextResponse<T> {
  const response = NextResponse.json(data, init);
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('x-request-id', requestId);
  return response;
}

export function bffNoContent(requestId: string = randomUUID()): NextResponse<null> {
  const response = new NextResponse<null>(null, { status: 204 });
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('x-request-id', requestId);
  return response;
}

export function bffError(
  error: unknown,
  requestId = error instanceof WebApiError && error.requestId ? error.requestId : randomUUID(),
): NextResponse<WebApiErrorPayload> {
  if (error instanceof ZodError) {
    console.error(JSON.stringify({
      event: 'bff_contract_validation_failed',
      requestId,
      issues: error.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
    }));
  }
  const payload = normalizeError(error, requestId);
  const response = NextResponse.json(payload, { status: payload.status });
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('x-request-id', requestId);
  return response;
}

function normalizeError(error: unknown, requestId: string): WebApiErrorPayload {
  if (error instanceof WebApiError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      fieldErrors: error.fieldErrors,
      requestId,
    };
  }
  if (error instanceof ZodError) {
    const fieldErrors = Object.fromEntries(
      Object.entries(error.flatten().fieldErrors).filter(
        (entry): entry is [string, string[]] => Array.isArray(entry[1]),
      ),
    );
    return {
      code: 'VALIDATION_ERROR',
      message: 'Les données envoyées sont invalides.',
      status: 422,
      fieldErrors,
      requestId,
    };
  }
  if (error instanceof SyntaxError) {
    return {
      code: 'MALFORMED_JSON',
      message: 'Le contenu JSON est invalide.',
      status: 400,
      requestId,
    };
  }
  return { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue.', status: 500, requestId };
}
