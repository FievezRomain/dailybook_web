import apiClient from '@/lib/apiClient';
import { User } from '@/types/user';

export const getUser = async (): Promise<User> => {
    const resInternal = await apiClient.get('/me');

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const loginPayload = { expotoken: resInternal.data.expotoken, timezone };
    const resExternal = await apiClient.post('/user', loginPayload);

    const user: User = {
        name: resInternal.data.name,
        email: resInternal.data.email,
        image: resInternal.data.picture,
        expotoken: resInternal.data.expotoken,
        uid: resInternal.data.uid,
        isPremium: resExternal.data.libelle?.toLowerCase() === 'premium',
        timezone: timezone,
    }

    return user;
};

export const addUser = async (user: User) => {
    const res = await apiClient.post('/user', user);
    return res.data;
};

export const deleteUser = async (id: string) => {
    await apiClient.delete(`/user/${id}`);
};
