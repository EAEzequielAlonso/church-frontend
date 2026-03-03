export type MentorshipType = 'DISCIPLESHIP' | 'COUNSELING' | 'FOLLOW_UP';
export type MentorshipMode = 'FORMAL' | 'INFORMAL';

export type MentorshipStatus = 'ACTIVE' | 'CLOSED' | 'PAUSED';

export interface MentorshipSummary {
    id: string;
    type: MentorshipType;
    status: MentorshipStatus;
    createdAt: string;
    mentor?: { id: string; name: string };
    mentee?: { id: string; name: string };
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
}

export interface CreateMentorshipNoteDto {
    content: string;
    isPrivate: boolean;
    meetingId?: string;
}

export interface CreateMentorshipTaskDto {
    title: string;
    description?: string;
    dueDate?: string; // ISO string
    isGroupTask: boolean;
    assignedChurchPersonId?: string;
}
