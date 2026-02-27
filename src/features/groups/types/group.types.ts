export type GroupType = 'SMALL_GROUP' | 'COURSE' | 'ACTIVITY' | 'DISCIPLESHIP' | 'MINISTRY_TEAM';
export type GroupRole = 'LEADER' | 'CO_LEADER' | 'MEMBER' | 'GUEST';
export type GroupVisibility = 'PUBLIC' | 'PRIVATE';

export interface GroupDto {
    id: string;
    churchId: string;
    name: string;
    description?: string;
    type: GroupType;
    visibility: GroupVisibility;
    address?: string;
    schedule?: string;
    objective?: string;
    hasStudyMaterial?: boolean;
    studyMaterial?: string;
    meetingUrl?: string;
    imageUrl?: string;
    participants?: GroupParticipantDto[];
    meetings?: GroupMeetingDto[];
    createdAt: string;
    updatedAt: string;
}

export interface ChurchPersonDto {
    id: string;
    person: {
        id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        profileImage?: string;
        email?: string;
        phone?: string;
    };
    membershipStatus: string;
}

export interface GroupParticipantDto {
    id: string;
    group: {
        id: string;
        name: string;
    };
    churchPerson: ChurchPersonDto;
    role: GroupRole;
    joinedAt: string;
}

export interface GroupMeetingDto {
    id: string;
    group: {
        id: string;
        name: string;
    };
    date: string; // ISO string
    location?: string;
    notes?: string;
    attendances?: GroupAttendanceDto[];
    createdAt: string;
}

export interface GroupAttendanceDto {
    id: string;
    meeting: {
        id: string;
        date: string;
    };
    churchPerson: {
        id: string;
        person: {
            id: string;
            fullName: string;
        };
    };
    present: boolean;
    notes?: string;
}

// Input DTOs
export interface CreateGroupDto {
    name: string;
    description?: string;
    type: GroupType;
    visibility: GroupVisibility;
    address?: string;
    schedule?: string;
    objective?: string;
    hasStudyMaterial?: boolean;
    studyMaterial?: string;
    meetingUrl?: string;
    imageUrl?: string;
}

export interface UpdateGroupDto extends Partial<CreateGroupDto> { }

export interface AddParticipantDto {
    churchPersonId: string;
    role: GroupRole;
}

export interface CreateMeetingDto {
    date: string; // ISO String
    location?: string;
    notes?: string;
}

export interface RegisterAttendanceItemDto {
    churchPersonId: string;
    present: boolean;
    notes?: string;
}

export interface RegisterAttendanceDto {
    items: RegisterAttendanceItemDto[];
}
