export type FamilyRole = 'FATHER' | 'MOTHER' | 'SPOUSE' | 'CHILD' | 'MEMBER';

export interface FamilyMemberDto {
    id: string; // Relationship ID (FamilyMember id)
    role: FamilyRole;
    member: {
        id: string; // Member Profile ID
        person: {
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            email?: string;
            profileImage?: string;
            birthDate?: string;
        };
        status: string; // e.g. MEMBER, CHILD
    };
    joinedAt: string;
}

export interface FamilyDto {
    id: string;
    name: string;
    members: FamilyMemberDto[];
    churchId?: string;
    createdAt: string;
    updatedAt: string;
}

// Input DTOs
export interface CreateFamilyMemberInput {
    memberId?: string;
    role: FamilyRole;
    newMember?: {
        firstName: string;
        lastName: string;
        email?: string;
        birthDate?: string;
        status?: string;
    };
}

export interface CreateFamilyDto {
    name: string;
    members: CreateFamilyMemberInput[];
}

export interface UpdateFamilyDto {
    name?: string;
}

export interface AddFamilyMemberDto {
    memberId: string;
    role: FamilyRole;
}

export interface RemoveFamilyMemberDto {
    familyId: string;
    memberId: string; // This is typically the Member ID, not the relationship ID, based on backend UseCase
}
