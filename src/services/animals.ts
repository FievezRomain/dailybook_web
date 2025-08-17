import apiClient from '@/lib/apiClient';
import { Animal } from '@/types/animal';

export const getAnimals = async () : Promise<Animal[]> => {
    const res = await apiClient.get('/animals');
    return res.data.rows;
};

export const createAnimal = async (animal: Partial<Animal>) => {
    const res = await apiClient.post('/animals', animal);
    return res.data;
};

export const updateAnimal = async (id: number, animal: Partial<Animal>) => {
    const res = await apiClient.put(`/animals/${id}`, animal);
    return res.data;
};

export const deleteAnimal = async (id: number) => {
    await apiClient.delete(`/animals/${id}`);
};
