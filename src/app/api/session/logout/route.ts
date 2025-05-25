import { SESSION_COOKIE_NAME } from '@/constants/cookies';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
