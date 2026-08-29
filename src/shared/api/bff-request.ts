import 'server-only';

import { timingSafeEqual } from 'node:crypto';
import type { NextResponse } from 'next/server';
import { z, type ZodType } from 'zod';
import { WebApiError } from './api-error';
import { bffError } from './bff-response';

export const CSRF_COOKIE_NAME = 'vasco-csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';
export const positiveIntegerParamSchema = z.coerce.number().int().positive();

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new WebApiError({ code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Un contenu JSON est requis.', status: 415 });
  }
  return schema.parse(await request.json());
}

export function assertCsrf(request: Request): void {
  const origin = request.headers.get('origin');
  if (!origin || !isSameOrigin(origin, new URL(request.url).origin)) {
    throw new WebApiError({ code: 'INVALID_ORIGIN', message: 'Origine de requête refusée.', status: 403 });
  }

  const cookieToken = readCookieHeader(request.headers.get('cookie'), CSRF_COOKIE_NAME);
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) {
    throw new WebApiError({ code: 'INVALID_CSRF_TOKEN', message: 'Jeton de sécurité invalide.', status: 403 });
  }
}

export function validateMutationRequest(request: Request): NextResponse | null {
  try {
    assertCsrf(request);
    return null;
  } catch (error) {
    return bffError(error);
  }
}

function isSameOrigin(value: string, expected: string): boolean {
  try {
    return new URL(value).origin === expected;
  } catch {
    return false;
  }
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function readCookieHeader(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  const item = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : undefined;
}
