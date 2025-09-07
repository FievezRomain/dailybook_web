import { cookies } from 'next/headers';
import admin from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/constants/cookies';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(session, true);

    if (!decodedToken.email_verified) {
      return new Response(JSON.stringify({ error: 'Email not verified' }), { status: 403 });
    }

    return new Response(
      JSON.stringify({
        name: decodedToken.name || decodedToken.email,
        email: decodedToken.email,
        uid: decodedToken.uid,
        picture: decodedToken.picture || null,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }
}
