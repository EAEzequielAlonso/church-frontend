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
        const { data } = await api.get(`/members?search=${query}`);
        // Assuming the backend supports ?search= or similar, or we filter locally if needed but backend is better.
        // Original code did client-side filtering on all members?
        // "const res = await api.get('/members'); const filtered = res.data.filter..." 
        // Oh, the original code fetched ALL members and filtered client side. 
        // I will replicate that behavior for safety, but wrapping it here.
        if (!query) return [];
        return data.filter((m: any) =>
        (m.person?.fullName?.toLowerCase().includes(query.toLowerCase()) ||
            m.person?.email?.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 5);
    }
};
