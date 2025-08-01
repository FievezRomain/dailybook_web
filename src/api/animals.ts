import apiClient from '@/lib/apiClient';
import api from '@/lib/axios';
import { Animal } from '@/types/animal';

export const getAnimals = async () : Promise<Animal[]> => {
    const res = await apiClient.get('/animals');
    return res.data.rows;
};

export const createAnimal = async (animal: Animal) => {
    const res = await apiClient.post('/animals', animal);
    return res.data;
};

export const deleteAnimal = async (id: string) => {
    await api.delete(`/animals/${id}`);
};
