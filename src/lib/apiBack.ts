import axios from 'axios';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/constants/cookies';

export async function apiBack(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) throw new Error('Unauthorized');

    const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/${path}`,
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
            'x-client': 'web'
        },
        data,
    });

    return response.data;
}
