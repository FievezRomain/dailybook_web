import api from '@/lib/axios';
import { User } from '@/types/user';

export const getUser = async (token: string): Promise<User[]> => {
    const res = await api.get('userByUser', {
        headers: {
        'x-access-token': token,
        },
    });
    return res.data;
};

export const addUser = async (user: User, token: string) => {
    const res = await api.post('/user', user, {
        headers: {
        'x-access-token': token,
        },
    });
    return res.data;
};

export const deleteUser = async (id: string, token: string) => {
    await api.delete(`/user/${id}`, {
        headers: {
        'x-access-token': token,
        },
    });
};
