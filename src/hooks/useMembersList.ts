import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface MemberOption {
    id: string;
    person: {
        firstName: string;
        lastName: string;
    };
    membershipStatus?: string;
}

export function useMembersList(status?: string, enabled: boolean = true, search?: string) {
    const [members, setMembers] = useState<MemberOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const fetchMembers = async () => {
            setLoading(true);
            try {
                let endpoint = '/members';
                const params = new URLSearchParams();

                if (search && search.length >= 2) {
                    endpoint = '/members/search';
                    params.append('q', search);
                } else {
                    if (status) params.append('status', status);
                }

                const res = await api.get(`${endpoint}?${params.toString()}`);
                const data = Array.isArray(res.data) ? res.data : [];
                // Limit to top 10 for display in dropdown if not searching specific
                setMembers(data.slice(0, 10));
            } catch (err) {
                console.error("Error fetching members:", err);
                setError("No se pudieron cargar los miembros");
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchMembers();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [status, enabled, search]);

    return { members, loading, error };
}
