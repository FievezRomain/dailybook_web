import api from '@/lib/axios';
import { UserPicture } from '@/types/user_picture';

export const getUserPicture = async (token: string): Promise<UserPicture[]> => {
    const res = await api.get('user_pictureByUser', {
        headers: {
        'x-access-token': token,
        },
    });
    return res.data;
};

export const addUserPicture = async (user_picture: UserPicture, token: string) => {
    const res = await api.post('/user_picture', user_picture, {
        headers: {
        'x-access-token': token,
        },
    });
    return res.data;
};

export const deleteUserPicture = async (id: string, token: string) => {
    await api.delete(`/user_picture/${id}`, {
        headers: {
        'x-access-token': token,
        },
    });
};
