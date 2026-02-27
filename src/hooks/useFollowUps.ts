import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export interface FollowUpPerson {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    status: 'VISITOR' | 'PROSPECT' | 'MEMBER' | 'ARCHIVED';
    assignedMemberId?: string;
    assignedMember?: {
        id: string;
        person: {
            firstName: string;
            lastName: string;
        }
    };
    createdAt: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface UseFollowUpsOptions {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    assignedToMe?: boolean;
}

export function useFollowUps(options: UseFollowUpsOptions = {}) {
    const [data, setData] = useState<FollowUpPerson[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchFollowUps = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options.status) params.append('status', options.status);
            if (options.search) params.append('search', options.search);
            if (options.assignedToMe) params.append('assignedToMe', 'true');
            params.append('page', (options.page || 1).toString());
            params.append('limit', (options.limit || 10).toString());

            const res = await api.get(`/follow-ups?${params.toString()}`);

            // Handle both legacy array response (if backend rollbacks) and new paginated response
            if (Array.isArray(res.data)) {
                setData(res.data);
                setMeta({ total: res.data.length, page: 1, limit: res.data.length, totalPages: 1 });
            } else {
                setData(res.data.data);
                setMeta(res.data.meta);
            }
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar los seguimientos');
        } finally {
            setLoading(false);
        }
    }, [options.status, options.search, options.page, options.limit, options.assignedToMe]);

    useEffect(() => {
        fetchFollowUps();
    }, [fetchFollowUps]);

    return {
        data,
        meta,
        loading,
        error,
        refetch: fetchFollowUps
    };
}
