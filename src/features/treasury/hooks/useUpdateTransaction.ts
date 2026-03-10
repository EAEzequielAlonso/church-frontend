import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { UpdateTransactionDto } from '../types/treasury.types';
import { toast } from 'sonner';

export function useUpdateTransaction() {
    const { mutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (id: string, data: UpdateTransactionDto, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            await treasuryApi.transactions.update(id, data);

            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/transactions'));
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/accounts'));

            toast.success('Transacción actualizada correctamente');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar la transacción');
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading };
}
