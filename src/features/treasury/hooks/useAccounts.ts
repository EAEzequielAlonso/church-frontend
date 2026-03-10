
import useSWR, { useSWRConfig } from 'swr';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import * as mapper from '../mappers/treasury.mapper';
import { TreasuryAccountModel, CreateAccountDto, UpdateAccountDto } from '../types/treasury.types';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';

export function useAccounts() {
    const { churchId } = useAuth();
    const { data: accounts, mutate, isLoading } = useSWR<TreasuryAccountModel[]>(
        churchId ? `/treasury/accounts?churchId=${churchId}` : null,
        () => treasuryApi.accounts.getAll(churchId!).then((dtos: any[]) => dtos.map(mapper.toUiAccount))
    );

    const createAccount = async (data: CreateAccountDto, onSuccess?: () => void) => {
        try {
            const newDto = await treasuryApi.accounts.create({ ...data, churchId: churchId! });
            const newAccount = mapper.toUiAccount(newDto);
            mutate();
            toast.success('Cuenta creada correctamente');
            if (onSuccess) onSuccess();
            return newAccount;
        } catch (error: any) {
            toast.error(error.message || 'Error al crear la cuenta');
            throw error;
        }
    };

    return { accounts: accounts || [], createAccount, mutate, isLoading };
}

export function useUpdateAccount() {
    const { mutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (id: string, data: UpdateAccountDto, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            await treasuryApi.accounts.update(id, data);
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
            await treasuryApi.accounts.delete(id);
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
