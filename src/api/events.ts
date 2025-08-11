import apiClient from '@/lib/apiClient';
import { Event } from '@/types/event';

export const getEvents = async () : Promise<Event[]> => {
    const res = await apiClient.get('/events');
    return res.data;
};

export const createEvent = async (event: Partial<Event>) => {
    const res = await apiClient.post('/events', event);
    return res.data;
};

export const updateEvent = async (id: number, event: Event) => {
    const res = await apiClient.put(`/events/${id}`, event);
    return res.data;
};

export const deleteEvent = async (id: number) => {
    await apiClient.delete(`/events/${id}`);
};
