
import useSWR, { useSWRConfig } from 'swr';
import * as api from '../api/treasury.api';
import * as mapper from '../mappers/treasury.mapper';
import { TreasuryAccountModel, CreateAccountDto, UpdateAccountDto } from '../types/treasury.types';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';

export function useAccounts() {
    const { churchId } = useAuth();
    const { data, error, isLoading, mutate } = useSWR(
        churchId ? `/treasury/accounts?churchId=${churchId}` : null,
        () => api.getAccounts(churchId!)
    );

    const accounts: TreasuryAccountModel[] = data ? data.map(mapper.toUiAccount) : [];

    return { accounts, isLoading, error, mutate };
}

export function useCreateAccount() {
    const { mutate } = useSWRConfig();
    const { churchId } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (data: CreateAccountDto, onSuccess?: () => void) => {
        if (!churchId) return;
        setIsLoading(true);
        try {
            await api.createAccount({ ...data, churchId }); // Pass churchId inside data
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/accounts'));
            toast.success('Cuenta creada correctamente');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error al crear la cuenta');
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading };
}

export function useUpdateAccount() {
    const { mutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (id: string, data: UpdateAccountDto, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            await api.updateAccount(id, data);
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/accounts'));
            toast.success('Cuenta actualizada correctamente');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar la cuenta');
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading };
}

export function useDeleteAccount() {
    const { mutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (id: string, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            await api.deleteAccount(id);
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/accounts'));
            toast.success('Cuenta eliminada correctamente');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar la cuenta');
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading };
}
