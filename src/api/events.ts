import api from '@/lib/axios';
import { Event } from '@/types/event';

export const getEvents = async (token: string): Promise<Event[]> => {
    const res = await api.get('eventsByUser', {
        headers: {
        'x-access-token': token,
        },
    });
    return res.data;
};

export const addEvent = async (event: Event, token: string) => {
    const res = await api.post('/evenements', event, {
        headers: {
        'x-access-token': token,
        },
    });
    return res.data;
};

export const deleteEvent = async (id: string, token: string) => {
    await api.delete(`/evenements/${id}`, {
        headers: {
        'x-access-token': token,
        },
    });
};
