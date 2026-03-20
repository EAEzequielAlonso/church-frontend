import { z } from 'zod';

export const createMentorshipMeetingSchema = z.object({
    scheduledDate: z.date(),
    location: z.string().optional(),
});

export type CreateMentorshipMeetingFormValues = z.infer<typeof createMentorshipMeetingSchema>;

export const createMentorshipNoteSchema = z.object({
    content: z.string().min(1, "El contenido de la nota no puede estar vacío"),
    type: z.enum(['INTERNAL', 'SHARED', 'SUPERVISION']),
});

export type CreateMentorshipNoteFormValues = z.infer<typeof createMentorshipNoteSchema>;

export const createMentorshipTaskSchema = z.object({
    title: z.string().min(1, "El título de la tarea es obligatorio"),
    description: z.string().optional(),
    mentorInstruction: z.string().optional(),
    dueDate: z.date().optional(),
    isGroupTask: z.boolean(),
    assignedChurchPersonId: z.string().optional(),
    meetingId: z.string().optional(),
});

export type CreateMentorshipTaskFormValues = z.infer<typeof createMentorshipTaskSchema>;
