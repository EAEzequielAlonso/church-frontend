import { useState } from 'react';
import { familiesApi } from '../api/families.api';
import { UpdateFamilyDto } from '../types/family.types';
import { toast } from 'sonner';

export function useUpdateFamily() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = async (id: string, data: UpdateFamilyDto, onSuccess?: () => void) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await familiesApi.update(id, data);
            toast.success('Familia actualizada correctamente');
            onSuccess?.();
            return result;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al actualizar familia';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading, error };
}
