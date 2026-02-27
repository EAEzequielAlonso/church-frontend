import { useState } from 'react';
import { familiesApi } from '../api/families.api';
import { toast } from 'sonner';

export function useDeleteFamily() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = async (id: string, onSuccess?: () => void) => {
        setIsLoading(true);
        setError(null);
        try {
            await familiesApi.delete(id);
            toast.success('Familia eliminada correctamente');
            onSuccess?.();
            return true;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al eliminar familia';
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading, error };
}
