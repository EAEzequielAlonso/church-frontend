import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { CreateTransactionDto } from '../types/treasury.types';
import { toast } from 'sonner';

export function useCreateTransaction() {
    const { mutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (data: CreateTransactionDto, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            await treasuryApi.transactions.create(data);

            // Invalidate cache
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/transactions'));
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/accounts')); // Balances change

            toast.success('Transacción creada correctamente');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error al crear la transacción');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading };
}
