import apiClient from '@/lib/apiClient';
import { Contact } from '@/types/contact';

export const getContacts = async (): Promise<Contact[]> => {
    const res = await apiClient.get('/contacts');
    return res.data;
};

export const addContact = async (contact: Partial<Contact>) => {
    const res = await apiClient.post('/contacts', contact);
    return res.data;
};

export const updateContact = async (id: number, contact: Partial<Contact>) => {
    const res = await apiClient.put(`/contacts/${id}`, contact);
    return res.data;
};

export const deleteContact = async (id: number) => {
    await apiClient.delete(`/contacts/${id}`);
};