import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SmallGroup } from '@/types/small-group';

export function useGroups() {
    const [groups, setGroups] = useState<SmallGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGroups = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al cargar grupos');
            const data = await res.json();
            setGroups(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar los grupos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleJoin = async (groupId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            toast.success('Te has unido al grupo');
            fetchGroups();
        } catch (error) {
            toast.error('No se pudo unir al grupo');
        }
    };

    const handleLeave = async (groupId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/leave`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            toast.success('Has salido del grupo');
            fetchGroups();
        } catch (error) {
            toast.error('No se pudo salir del grupo');
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    return {
        groups,
        isLoading,
        fetchGroups,
        handleJoin,
        handleLeave
    };
}
