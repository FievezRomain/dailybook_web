import apiClient from '@/lib/apiClient';
import api from '@/lib/axios';
import { Event } from '@/types/event';

export const getEvents = async () : Promise<Event[]> => {
    const res = await apiClient.get('/events');
    return res.data;
};

export const createEvent = async (event: Event) => {
    const res = await apiClient.post('/events', event);
    return res.data;
};

export const deleteEvent = async (id: string) => {
    await api.delete(`/evenements/${id}`);
};
