import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SmallGroup } from '@/types/small-group';
import { useAuth } from '@/context/AuthContext';

export function useGroupDetails(groupId: string) {
    const [group, setGroup] = useState<SmallGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRemoving, setIsRemoving] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const fetchGroup = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al cargar grupo');
            const data = await res.json();
            setGroup(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar la información del grupo');
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        if (groupId) fetchGroup();
    }, [groupId, fetchGroup]);

    const handleRemoveMember = async (memberId: string) => {
        setIsRemoving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/members/${memberId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            toast.success('Miembro eliminado');
            fetchGroup();
        } catch (error) {
            toast.error('No se pudo eliminar al miembro');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleRemoveGuest = async (guestId: string) => {
        setIsRemoving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/guests/${guestId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            toast.success('Invitado eliminado');
            fetchGroup();
        } catch (error) {
            toast.error('No se pudo eliminar al invitado');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleRemoveEvent = async (eventId: string) => {
        setIsRemoving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agenda/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            toast.success('Encuentro eliminado');
            fetchGroup();
        } catch (error) {
            toast.error('No se pudo eliminar el encuentro');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleLeave = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/leave`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            toast.success('Has salido del grupo');
            router.push('/groups');
        } catch (error) {
            toast.error('No se pudo salir del grupo');
        }
    };

    // Derived State
    const isEncargado = group?.members?.some(m => m.member.id === user?.memberId && m.role === 'MODERATOR');
    const canManage = isEncargado || user?.roles?.includes('ADMIN_CHURCH');
    const isFinished = group?.status === 'FINISHED';

    return {
        group,
        isLoading,
        isRemoving,
        fetchGroup,
        handleRemoveMember,
        handleRemoveGuest,
        handleRemoveEvent,
        handleLeave,
        isEncargado,
        canManage,
        isFinished,
        user
    };
}
