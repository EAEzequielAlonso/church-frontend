import api from '@/lib/api';
import { MentorshipType, MentorshipStatus, PaginatedMentorshipResponse, CreateMentorshipDto, CreateMentorshipMeetingDto, CreateMentorshipNoteDto, CreateMentorshipTaskDto } from '../types/mentorship.types';
import { MentorshipDetail } from '../types/mentorship-detail.types';

export interface GetMentorshipsParams {
    page?: number;
    limit?: number;
    type?: MentorshipType;
    status?: MentorshipStatus;
}

export const mentorshipService = {
    async getMentorships(params: GetMentorshipsParams): Promise<PaginatedMentorshipResponse> {
        // Remove undefined values to prevent empty query params
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
        );

        const { data } = await api.get<PaginatedMentorshipResponse>('/mentorship', {
            params: cleanParams
        });

        return data;
    },

    async getInvitations(params: GetMentorshipsParams = {}): Promise<PaginatedMentorshipResponse> {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
        );

        const { data } = await api.get<PaginatedMentorshipResponse>('/mentorship/invitations', {
            params: cleanParams
        });

        return data;
    },

    async createMentorship(payload: CreateMentorshipDto): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>('/mentorship', payload);
        return data;
    },

    async getMentorshipById(id: string): Promise<MentorshipDetail> {
        const { data } = await api.get<MentorshipDetail>(`/mentorship/${id}`);
        return data;
    },

    async createMeeting(mentorshipId: string, payload: CreateMentorshipMeetingDto): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>(`/mentorship/${mentorshipId}/meetings`, payload);
        return data;
    },

    async updateMeeting(mentorshipId: string, meetingId: string, payload: Partial<CreateMentorshipMeetingDto>): Promise<void> {
        await api.post(`/mentorship/${mentorshipId}/meetings/${meetingId}/update`, payload);
    },

    async deleteMeeting(mentorshipId: string, meetingId: string): Promise<void> {
        await api.delete(`/mentorship/${mentorshipId}/meetings/${meetingId}`);
    },

    async createNote(mentorshipId: string, payload: CreateMentorshipNoteDto): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>(`/mentorship/${mentorshipId}/notes`, payload);
        return data;
    },

    async createTask(mentorshipId: string, payload: CreateMentorshipTaskDto): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>(`/mentorship/${mentorshipId}/tasks`, payload);
        return data;
    },

    async startTask(taskId: string): Promise<void> {
        await api.post(`/mentorship/tasks/${taskId}/start`);
    },

    async submitTask(taskId: string, payload: { menteeResponse: string }): Promise<void> {
        await api.post(`/mentorship/tasks/${taskId}/submit`, payload);
    },

    async reviewTask(taskId: string, payload: { mentorFeedback?: string }): Promise<void> {
        await api.post(`/mentorship/tasks/${taskId}/review`, payload);
    },

    async updateTask(taskId: string, payload: Partial<CreateMentorshipTaskDto>): Promise<void> {
        await api.patch(`/mentorship/tasks/${taskId}`, payload);
    },

    async deleteTask(taskId: string): Promise<void> {
        await api.delete(`/mentorship/tasks/${taskId}`);
    },

    async acceptParticipation(participantId: string): Promise<void> {
        await api.post(`/mentorship/participants/${participantId}/accept`);
    },

    async declineParticipation(participantId: string): Promise<void> {
        await api.post(`/mentorship/participants/${participantId}/decline`);
    }
};
