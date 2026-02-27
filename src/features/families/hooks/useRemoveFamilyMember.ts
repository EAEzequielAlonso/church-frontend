import { useState } from 'react';
import { familiesApi } from '../api/families.api';
import { toast } from 'sonner';

export function useRemoveFamilyMember() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = async (familyId: string, memberId: string, onSuccess?: () => void) => {
        setIsLoading(true);
        setError(null);
        try {
            await familiesApi.removeMember(familyId, memberId);
            toast.success('Miembro eliminado de la familia');
            onSuccess?.();
            return true;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al eliminar miembro';
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading, error };
}
