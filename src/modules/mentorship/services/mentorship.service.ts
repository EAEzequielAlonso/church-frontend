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

    async createNote(mentorshipId: string, payload: CreateMentorshipNoteDto): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>(`/mentorship/${mentorshipId}/notes`, payload);
        return data;
    },

    async createTask(mentorshipId: string, payload: CreateMentorshipTaskDto): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>(`/mentorship/${mentorshipId}/tasks`, payload);
        return data;
    }
};
