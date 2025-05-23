import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value;

  const isLoggedIn = await verifyToken(token);
  const pathname = req.nextUrl.pathname;

  const isProtected = pathname.startsWith('/dashboard');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

async function verifyToken(token?: string): Promise<boolean> {
  if (!token) return false;

  try {
    await admin.auth().verifyIdToken(token);
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
