import apiClient from '@/lib/apiClient';
import { Note } from '@/types/note';

export const getNotes = async (): Promise<Note[]> => {
    const res = await apiClient.get('/notes');
    return res.data;
};

export const addNote = async (note: Partial<Note>) => {
    const res = await apiClient.post('/notes', note);
    return res.data;
};

export const updateNote = async (id: number, note: Partial<Note>) => {
    const res = await apiClient.put(`/notes/${id}`, note);
    return res.data;
};

export const deleteNote = async (id: number) => {
    await apiClient.delete(`/notes/${id}`);
};