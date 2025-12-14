import apiClient from '@/lib/apiClient';
import { Animal, AnimalBodyPicture } from '@/types/animal';

export const getAnimals = async () : Promise<Animal[]> => {
    const res = await apiClient.get('/animals');
    return res.data.rows;
};

export const getBodyPicturesAnimal = async (id: number) : Promise<AnimalBodyPicture[]> => {
    const res = await apiClient.get(`/animals/${id}/body`);
    return res.data.rows;
};

export const addBodyPicturesAnimal = async (id: number, filename: string) : Promise<AnimalBodyPicture[]> => {
    const res = await apiClient.post(`/animals/${id}/body`, { idanimal: id, filename });
    return res.data.rows;
};

export const deleteBodyPicturesAnimal = async (id: number) : Promise<AnimalBodyPicture[]> => {
    const res = await apiClient.delete(`/animals/${id}/body`);
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
