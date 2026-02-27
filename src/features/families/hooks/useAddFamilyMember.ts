import { useState } from 'react';
import { familiesApi } from '../api/families.api';
import { toast } from 'sonner';

export function useAddFamilyMember() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = async (familyId: string, memberId: string, role: string, onSuccess?: () => void) => {
        setIsLoading(true);
        setError(null);
        try {
            await familiesApi.addMember(familyId, memberId, role);
            toast.success('Miembro agregado a la familia');
            onSuccess?.();
            return true;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al agregar miembro';
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading, error };
}
