import api from '@/lib/api';
import {
    ProgramDto,
    CreateProgramDto,
    UpdateProgramDto,
    ProgramCategory,
    CreateSessionDto,
    AddParticipantDto,
    AddGuestDto
} from '../types/program.types';

export const programsApi = {
    getAll: async (type: ProgramCategory): Promise<ProgramDto[]> => {
        const { data } = await api.get(`/courses?type=${type}`);
        return data;
    },

    getById: async (id: string): Promise<ProgramDto> => {
        const { data } = await api.get(`/courses/${id}`);
        return data;
    },

    create: async (payload: CreateProgramDto): Promise<ProgramDto> => {
        const { data } = await api.post('/courses', payload);
        return data;
    },

    update: async (id: string, payload: UpdateProgramDto): Promise<ProgramDto> => {
        const { data } = await api.patch(`/courses/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/courses/${id}`);
    },

    // Sessions
    createSession: async (programId: string, payload: CreateSessionDto) => {
        const { data } = await api.post(`/courses/${programId}/sessions`, payload);
        return data;
    },

    updateSession: async (sessionId: string, payload: Partial<CreateSessionDto>) => {
        const { data } = await api.patch(`/courses/sessions/${sessionId}`, payload);
        return data;
    },

    // Participants (Members)
    join: async (programId: string, memberIds: string[]): Promise<void> => {
        await api.post(`/courses/${programId}/join`, { memberIds });
    },

    leave: async (programId: string): Promise<void> => {
        await api.post(`/courses/${programId}/leave`);
    },

    addParticipant: async (programId: string, payload: AddParticipantDto) => {
        const { data } = await api.post(`/courses/${programId}/participants`, payload);
        return data; // returns enrollment result
    },

    removeParticipant: async (participantId: string): Promise<void> => {
        await api.delete(`/courses/participants/${participantId}`);
    },

    // Guests
    addGuest: async (programId: string, payload: AddGuestDto) => {
        const { data } = await api.post(`/courses/${programId}/guests`, payload);
        return data;
    },

    removeGuest: async (guestId: string): Promise<void> => {
        await api.delete(`/courses/guests/${guestId}`);
    },

    updateGuest: async (guestId: string, payload: Partial<AddGuestDto>) => {
        const { data } = await api.patch(`/courses/guests/${guestId}`, payload);
        return data;
    },

    promoteGuestToVisitor: async (guestId: string) => {
        const { data } = await api.post(`/courses/guests/${guestId}/promote-to-visitor`);
        return data;
    },

    promoteGuestToMember: async (guestId: string) => {
        const { data } = await api.post(`/courses/guests/${guestId}/promote-to-member`);
        return data;
    },

    // Stats & Attendance
    getStats: async (programId: string) => {
        const { data } = await api.get(`/courses/${programId}/stats`);
        return data;
    },

    getAttendance: async (sessionId: string) => {
        const { data } = await api.get(`/courses/sessions/${sessionId}/attendance`);
        return data;
    },

    registerAttendance: async (sessionId: string, items: any[]) => {
        const { data } = await api.post(`/courses/sessions/${sessionId}/attendance`, items);
        return data;
    }
};
