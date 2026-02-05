export type ProgramCategory = 'COURSE' | 'ACTIVITY';

export type ProgramStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'COMPLETED';

export type ProgramRole = 'INSTRUCTOR' | 'ATTENDEE';

export interface ProgramDto {
    id: string;
    title: string;
    description?: string;
    category?: string;
    type: ProgramCategory;
    status: ProgramStatus;
    startDate: string;
    endDate?: string;
    capacity?: number;
    color?: string;

    // Relations
    sessions?: ProgramSessionDto[];
    participants?: ProgramParticipantDto[];
    guests?: ProgramGuestDto[];
    createdBy?: {
        id: string;
        person: {
            id: string;
            fullName: string;
            profileImage?: string;
        }
    };

    createdAt: string;
    updatedAt: string;
}

export interface ProgramSessionDto {
    id: string;
    date: string;
    startTime: string; // HH:mm
    estimatedDuration?: number;
    topic: string;
    notes?: string;
    event?: {
        id: string;
        title: string;
    };
}

export interface ProgramParticipantDto {
    id: string;
    member: {
        id: string;
        person: {
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            profileImage?: string;
        }
    };
    role: ProgramRole;
    joinedAt: string;
}

export interface ProgramGuestDto {
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    followUpPerson?: {
        id: string;
        status: string;
    };
    personInvited?: {
        id: string;
    };
    invitedBy?: {
        id: string;
        person: {
            fullName: string;
        }
    };
}

// Input DTOs
export interface CreateProgramDto {
    title: string;
    type: ProgramCategory;
    description?: string;
    category?: string;
    startDate: string;
    endDate?: string;
    capacity?: number;
    color?: string;
}

export interface UpdateProgramDto extends Partial<CreateProgramDto> {
    status?: ProgramStatus;
}

export interface CreateSessionDto {
    date: string;
    startTime: string;
    estimatedDuration?: number;
    topic: string;
    notes?: string;
}

export interface AddParticipantDto {
    memberId: string;
    role?: ProgramRole;
}

export interface AddGuestDto {
    fullName: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    followUpPersonId?: string;
    personInvitedId?: string;
}
