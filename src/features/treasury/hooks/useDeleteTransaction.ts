import { useState } from 'react';
import { useSWRConfig } from 'swr';
import * as api from '../api/treasury.api';
import { toast } from 'sonner';

export function useDeleteTransaction() {
    const { mutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (id: string, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            await api.deleteTransaction(id);

            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/transactions'));
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/accounts'));

            toast.success('Transacción eliminada correctamente');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar la transacción');
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading };
}
