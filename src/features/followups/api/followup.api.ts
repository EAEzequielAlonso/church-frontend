import api from '@/lib/api';
import { Followup, FollowupNote, FollowupStatus, FollowupNoteType } from '../types/followup.types';

export const followupApi = {
    getAll: async (params?: {
        status?: FollowupStatus;
        assignedToPersonId?: string;
        search?: string;
        page?: number;
        limit?: number
    }) => {
        const { data } = await api.get<{ data: Followup[], meta: any }>('/followups', { params });
        return data;
    },

    getOne: async (id: string) => {
        const { data } = await api.get<Followup>(`/followups/${id}`);
        return data;
    },

    create: async (data: { followupPersonId: string; assignedToPersonId: string }) => {
        const { data: result } = await api.post<Followup>('/followups', data);
        return result;
    },

    assign: async (id: string, newAssignedPersonId: string) => {
        const { data } = await api.patch<Followup>(`/followups/${id}/assign`, { newAssignedPersonId });
        return data;
    },

    changeStatus: async (id: string, status: FollowupStatus) => {
        const { data } = await api.patch<Followup>(`/followups/${id}/status`, { status });
        return data;
    },

    getNotes: async (id: string) => {
        const { data } = await api.get<FollowupNote[]>(`/followups/${id}/notes`);
        return data;
    },

    createNote: async (id: string, data: { content: string; type: FollowupNoteType }) => {
        const { data: result } = await api.post<FollowupNote>(`/followups/${id}/notes`, data);
        return result;
    }
};
