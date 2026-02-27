import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export type FollowUpNoteType = 'INTERNAL' | 'SHARED' | 'PASTORAL';

export interface FollowUpNote {
    id: string;
    type: FollowUpNoteType;
    text: string;
    createdAt: string;
    authorPersonId: string;
    author?: {
        firstName: string;
        lastName: string;
    };
}

export function useFollowUpNotes(followupId: string) {
    const [notes, setNotes] = useState<FollowUpNote[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotes = useCallback(async () => {
        if (!followupId) return;
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/follow-ups/${followupId}/notes`);
            setNotes(res.data);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar las notas');
        } finally {
            setLoading(false);
        }
    }, [followupId]);

    const addNote = async (data: { text: string; type: FollowUpNoteType }) => {
        try {
            await api.post(`/follow-ups/${followupId}/notes`, data);
            await fetchNotes(); // Refresh
            return true;
        } catch (err: any) {
            console.error(err);
            throw new Error('Error al guardar la nota');
        }
    };

    const updateNote = async (noteId: string, data: { text: string; type: FollowUpNoteType }) => {
        try {
            await api.patch(`/follow-ups/${followupId}/notes/${noteId}`, data);
            await fetchNotes(); // Refresh
            return true;
        } catch (err: any) {
            console.error(err);
            throw new Error('Error al actualizar la nota');
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            await api.delete(`/follow-ups/${followupId}/notes/${noteId}`);
            await fetchNotes(); // Refresh
            return true;
        } catch (err: any) {
            console.error(err);
            throw new Error('Error al eliminar la nota');
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    return {
        notes,
        loading,
        error,
        refetch: fetchNotes,
        addNote,
        updateNote,
        deleteNote
    };
}
