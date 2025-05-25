import { cookies } from 'next/headers';
import admin from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/constants/cookies';

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!session) return null;

    try {
        const decodedToken = await admin.auth().verifySessionCookie(session, true);
        if (!decodedToken.email_verified) return null;
        return decodedToken;
    } catch (error) {
        return null;
    }
}
