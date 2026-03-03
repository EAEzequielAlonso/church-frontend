import { z } from 'zod';
import { MentorshipType, MentorshipMode } from '../types/mentorship.types';

export const createMentorshipSchema = z.object({
    type: z.enum(['DISCIPLESHIP', 'COUNSELING', 'FOLLOW_UP'] as const),
    mode: z.enum(['FORMAL', 'INFORMAL'] as const),
    mentors: z.array(z.object({
        churchPersonId: z.string(),
        hasUserAccount: z.boolean()
    })).min(1, "Debe seleccionar al menos un mentor"),
    participants: z.array(z.object({
        churchPersonId: z.string(),
        hasUserAccount: z.boolean()
    })).min(1, "Debe seleccionar al menos una persona guiada"),
    config: z.object({
        mainTopic: z.string().optional(),
        inIntegration: z.boolean().optional(),
        initialNotes: z.string().optional()
    }).optional()
}).superRefine((data, ctx) => {
    // Basic array checking (Ensure no identical selections across both arrays)
    const mentorIds = data.mentors.map(m => m.churchPersonId);
    const participantIds = data.participants.map(p => p.churchPersonId);

    const hasOverlap = mentorIds.some(id => participantIds.includes(id));
    if (hasOverlap) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Un mentor no puede ser al mismo tiempo la persona guiada",
            path: ['participants']
        });
    }

    // Modal restrictions depending on FORMAL vs INFORMAL
    if (data.mode === 'INFORMAL') {
        if (data.mentors.length > 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Un proceso informal solo permite 1 mentor máximo",
                path: ['mentors']
            });
        }
        if (data.participants.length > 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Un proceso informal solo permite 1 persona guiada máxima",
                path: ['participants']
            });
        }
    }

    // Required fields per Type
    if (!data.config?.mainTopic || data.config.mainTopic.trim() === '') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El motivo principal es requerido para iniciar el proceso",
            path: ['config.mainTopic']
        });
    }
});

export type CreateMentorshipFormValues = z.infer<typeof createMentorshipSchema>;
