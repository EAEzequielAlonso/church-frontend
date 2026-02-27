import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { FollowUpPerson } from './useFollowUps';

export interface FollowUpDetail extends FollowUpPerson {
    // Add detail specific fields if any
    notes?: any[]; // We fetch notes separately usually, but maybe detail includes them? UseCase says GetFollowupDetailUseCase returns detail.
    // Let's assume detail is just the person with relations.
    updatedAt: string;
    archivedAt?: string;
    churchId: string;
    createdByMember?: {
        person: {
            firstName: string;
            lastName: string;
        }
    };
}

export function useFollowUpDetail(id: string) {
    const [data, setData] = useState<FollowUpDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/follow-ups/${id}`);
            setData(res.data);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar el detalle');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return {
        data,
        loading,
        error,
        refetch: fetchDetail
    };
}
