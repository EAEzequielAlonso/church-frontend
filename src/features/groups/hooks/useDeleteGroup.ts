import { useState } from 'react';
import { groupsApi } from '../api/groups.api';

export function useDeleteGroup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteGroup = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await groupsApi.delete(id);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al eliminar el grupo';
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deleteGroup,
        isLoading,
        error
    };
}
