import apiClient from '@/lib/apiClient';
import { Objective } from '@/types/objective';

export const getObjectifs = async () : Promise<Objective[]> => {
    const res = await apiClient.get('/objectives');
    return res.data;
};

export const addObjectifs = async (objectif: Partial<Objective>) => {
    const res = await apiClient.post('/objectives', objectif);
    return res.data;
};

export const updateObjectifs = async (id: number, objectif: Objective) => {
    const res = await apiClient.put(`/objectives/${id}`, objectif);
    return res.data;
};

export const updateSousEtapesObjectifs = async (id: number, objectif: Objective) => {
    const res = await apiClient.put(`/objectives/${id}/sousetapes`, objectif);
    return res.data;
};

export const deleteObjectifs = async (id: number) => {
    await apiClient.delete(`/objectives/${id}`);
};
