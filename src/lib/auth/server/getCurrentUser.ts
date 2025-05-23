import { cookies } from 'next/headers';
import admin from '@/lib/firebase-admin';

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) return null;

    try {
        const decodedToken = await admin.auth().verifySessionCookie(session, true);
        return decodedToken;
    } catch (error) {
        return null;
    }
}
