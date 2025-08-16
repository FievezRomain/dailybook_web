import apiClient from '@/lib/apiClient';
import api from '@/lib/axios';
import { Objectifs } from '@/types/objectifs';

export const getObjectifs = async () : Promise<Objectifs[]> => {
    const res = await apiClient.get('/objectifs');
    return res.data;
};

export const addObjectifs = async (objectif: Objectifs, token: string) => {
    const res = await api.post('/evenements', objectif, {
        headers: {
        'x-access-token': token,
        },
    });
    return res.data;
};

export const deleteObjectifs = async (id: string, token: string) => {
    await api.delete(`/evenements/${id}`, {
        headers: {
        'x-access-token': token,
        },
    });
};
