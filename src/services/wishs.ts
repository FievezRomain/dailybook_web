import apiClient from '@/lib/apiClient';
import { Wish } from '@/types/wish';

export const getWishs = async (): Promise<Wish[]> => {
    const res = await apiClient.get('/wishes');
    return res.data;
};

export const addWish = async (wish: Partial<Wish>) => {
    const res = await apiClient.post('/wishes', wish);
    return res.data;
};

export const updateWish = async (id: number, wish: Partial<Wish>) => {
    const res = await apiClient.put(`/wishes/${id}`, wish);
    return res.data;
};

export const deleteWish = async (id: number) => {
    await apiClient.delete(`/wishes/${id}`);
};