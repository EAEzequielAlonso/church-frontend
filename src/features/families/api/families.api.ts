import api from '@/lib/api';
import {
    FamilyDto,
    CreateFamilyDto,
    UpdateFamilyDto,
    AddFamilyMemberDto,
    RemoveFamilyMemberDto,
    FamilyMemberDto
} from '../types/family.types';

export interface MemberSearchResultDto {
    id: string;
    person: {
        fullName: string;
        email?: string;
        profileImage?: string;
    };
    status: string;
}

export const familiesApi = {
    getAll: async (): Promise<FamilyDto[]> => {
        const { data } = await api.get('/families');
        return data;
    },

    getMyFamily: async (): Promise<FamilyDto> => {
        const { data } = await api.get('/families/my-family');
        return data;
    },

    getById: async (id: string): Promise<FamilyDto> => {
        const { data } = await api.get(`/families/${id}`);
        return data;
    },

    create: async (payload: CreateFamilyDto): Promise<FamilyDto> => {
        const { data } = await api.post('/families', payload);
        return data;
    },

    update: async (id: string, payload: UpdateFamilyDto): Promise<FamilyDto> => {
        const { data } = await api.patch(`/families/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/families/${id}`);
    },

    addMember: async (familyId: string, memberId: string, role: string): Promise<void> => {
        await api.post(`/families/${familyId}/members`, { memberId, role });
    },

    removeMember: async (familyId: string, memberId: string): Promise<void> => {
        await api.delete(`/families/${familyId}/members/${memberId}`);
    },

    searchMembers: async (query: string): Promise<MemberSearchResultDto[]> => {
        const { data } = await api.get(`/members`);

        if (!query) {
            return data.slice(0, 10);
        }

        return data.filter((m: any) =>
        (m.person?.fullName?.toLowerCase().includes(query.toLowerCase()) ||
            m.person?.email?.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 10);
    }
};
