import apiClient from '@/lib/apiClient';
import { Note } from '@/types/note';

export const getNotes = async (): Promise<Note[]> => {
    const res = await apiClient.get('/notes');
    return res.data;
};

export const addNote = async (note: Note) => {
    const res = await apiClient.post('/notes', note);
    return res.data;
};

export const updateNote = async (id: string, note: Partial<Note>) => {
    const res = await apiClient.put(`/notes/${id}`, note);
    return res.data;
};

export const deleteNote = async (id: string) => {
    await apiClient.delete(`/notes/${id}`);
};