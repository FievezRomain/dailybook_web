import apiClient from '@/lib/apiClient';
import { Group } from '@/types/group';

export const getGroups = async (): Promise<Group[]> => {
    const res = await apiClient.get('/groups');
    return res.data;
};

export const addGroup = async (group: Group) => {
    const res = await apiClient.post('/groups', group);
    return res.data;
};

export const updateGroup = async (id: string, group: Partial<Group>) => {
    const res = await apiClient.put(`/groups/${id}`, group);
    return res.data;
};

export const deleteGroup = async (id: string) => {
    await apiClient.delete(`/groups/${id}`);
};