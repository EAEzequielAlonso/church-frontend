import { CalendarEvent } from './agenda';
import { ChurchMember } from './auth-types';

export interface SmallGroup {
    id: string;
    name: string;
    description?: string;
    objective?: string;
    studyMaterial?: string;
    currentTopic?: string;
    meetingDay?: string;
    meetingTime?: string;
    address?: string;
    members?: SmallGroupMember[];
    guests?: SmallGroupGuest[];
    events?: CalendarEvent[];
    openEnrollment?: boolean; // Added
    status?: 'ACTIVE' | 'SUSPENDED' | 'FINISHED'; // Added
    createdAt: string;
    updatedAt: string;
}

export interface SmallGroupGuest {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    addedAt: string;
    // We can add related entities if needed
    followUpPerson?: any;
    personInvited?: any;
}

export interface SmallGroupMember {
    id: string;
    role: string;
    joinedAt: string;
    member: ChurchMember & {
        person: {
            id: string;
            firstName: string;
            lastName: string;
            email: string; // Backend sends email
            phoneNumber: string; // Backend sends phoneNumber
            avatarUrl: string; // Backend sends avatarUrl
        }
    };
}

export interface CreateSmallGroupDto {
    name: string;
    description?: string;
    objective?: string;
    studyMaterial?: string;
    currentTopic?: string;
    meetingDay?: string;
    meetingTime?: string;
    address?: string;
}
