import api from '@/lib/api';
import {
    GroupDto,
    CreateGroupDto,
    UpdateGroupDto,
    GroupType,
    CreateMeetingDto,
    AddParticipantDto,
    RegisterAttendanceDto
} from '../types/group.types';

export const groupsApi = {
    getAll: async (type?: GroupType): Promise<GroupDto[]> => {
        const url = type ? `/groups?type=${type}` : '/groups';
        const { data } = await api.get(url);
        return data;
    },

    getById: async (id: string): Promise<GroupDto> => {
        const { data } = await api.get(`/groups/${id}`);
        return data;
    },

    create: async (payload: CreateGroupDto): Promise<GroupDto> => {
        const { data } = await api.post('/groups', payload);
        return data;
    },

    update: async (id: string, payload: UpdateGroupDto): Promise<GroupDto> => {
        const { data } = await api.patch(`/groups/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/groups/${id}`);
    },

    // Participant Management
    join: async (groupId: string, churchPersonId: string): Promise<void> => {
        // Assuming direct enroll via the new groups endpoint structure
        await api.post(`/groups/${groupId}/enroll/${churchPersonId}`);
    },

    leave: async (groupId: string, churchPersonId: string): Promise<void> => {
        // En backend no habiamos implementado el deleteParticipant directo aun,
        // pero podemos asumir que usa el estandar DELETE /groups/:id/participants/:participantId
        // o si es a traves del enroll, lo ajustaremos
        await api.delete(`/groups/${groupId}/enroll/${churchPersonId}`);
    },

    addParticipant: async (groupId: string, payload: AddParticipantDto) => {
        const { data } = await api.post(`/groups/${groupId}/participants`, payload);
        return data;
    },

    removeParticipant: async (groupId: string, participantId: string): Promise<void> => {
        await api.delete(`/groups/${groupId}/participants/${participantId}`);
    },

    // Meeting / Attendance Management (To be fully implemented in backend if not yet)
    createMeeting: async (groupId: string, payload: CreateMeetingDto) => {
        const { data } = await api.post(`/groups/${groupId}/meetings`, payload);
        return data;
    },

    registerAttendance: async (meetingId: string, payload: RegisterAttendanceDto) => {
        const { data } = await api.post(`/groups/meetings/${meetingId}/attendance`, payload);
        return data;
    },

    getMeetingAttendance: async (meetingId: string) => {
        const { data } = await api.get(`/groups/meetings/${meetingId}/attendance`);
        return data;
    }
};
