import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/constants/cookies';

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 jours

  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'auth/session-creation-failed' }, { status: 401 });
  }
}
