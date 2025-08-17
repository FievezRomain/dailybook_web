import apiClient from '@/lib/apiClient';
import { Objective } from '@/types/objective';

export const getObjectifs = async () : Promise<Objective[]> => {
    const res = await apiClient.get('/objectives');
    return res.data;
};

export const addObjectifs = async (objectif: Objective) => {
    const res = await apiClient.post('/objectives', objectif);
    return res.data;
};

export const updateObjectifs = async (id: string, objectif: Partial<Objective>) => {
    const res = await apiClient.put(`/objectives/${id}`, objectif);
    return res.data;
};

export const deleteObjectifs = async (id: string) => {
    await apiClient.delete(`/objectives/${id}`);
};
