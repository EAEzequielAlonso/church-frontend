export type MentorshipType = 'DISCIPLESHIP' | 'COUNSELING' | 'FOLLOW_UP';
export type MentorshipMode = 'FORMAL' | 'INFORMAL';

export type MentorshipStatus = 'ACTIVE' | 'CLOSED' | 'PAUSED';

export interface MentorshipParticipant {
    id: string;
    churchPersonId: string;
    role: 'MENTOR' | 'PARTICIPANT';
    status: 'PENDING' | 'AUTO_ACCEPTED' | 'ACCEPTED';
    joinedAt: string;
}

export interface MentorshipSummary {
    id: string;
    type: MentorshipType;
    status: MentorshipStatus;
    createdAt: string;
    mentor?: { id: string; name: string };
    mentee?: { id: string; name: string };
    motive?: string;
    mode?: MentorshipMode;
    mentorSummary?: string;
    menteeSummary?: string;
    participants?: MentorshipParticipant[];
}

export interface PaginatedMentorshipResponse {
    data: MentorshipSummary[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateMentorshipDto {
    type: MentorshipType;
    mode: MentorshipMode;
    mentors: {
        churchPersonId: string;
        hasUserAccount: boolean;
    }[];
    participants: {
        churchPersonId: string;
        hasUserAccount: boolean;
    }[];
    config?: {
        mainTopic?: string;
        inIntegration?: boolean;
        initialNotes?: string;
    };
}

export interface CreateMentorshipMeetingDto {
    scheduledDate: string; // ISO string
    endDate?: string;
    title?: string;
    description?: string;
    color?: string;
    location?: string;
    type?: string; 
}

export interface CreateMentorshipNoteDto {
    content: string;
    type: 'INTERNAL' | 'SHARED' | 'SUPERVISION';
    meetingId?: string;
}

export interface CreateMentorshipTaskDto {
    title: string;
    description?: string;
    dueDate?: string; // ISO string
    isGroupTask: boolean;
    assignedChurchPersonId?: string;
    mentorInstruction?: string;
    meetingId?: string;
}
