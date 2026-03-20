import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { TransactionCategory, CreateCategoryDto, UpdateCategoryDto } from '../types/treasury.types';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function useCategories(type?: 'income' | 'expense') {
    const { churchId } = useAuth();
    const { mutate: globalMutate } = useSWRConfig();

    // UI state for creation
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const { data: categories = [], error, isLoading, mutate } = useSWR<TransactionCategory[]>(
        churchId ? `/treasury/categories?churchId=${churchId}${type ? `&type=${type}` : ''}` : null,
        () => treasuryApi.categories.getAll(churchId!, type)
    );

    const invalidateAll = () => {
        globalMutate((key) => typeof key === 'string' && key.startsWith('/treasury/categories'));
    };

    const createCategory = async (data: CreateCategoryDto) => {
        if (!churchId) {
            setCreateError('Church ID is not available.');
            return;
        }
        setIsCreating(true);
        setCreateError(null);
        try {
            const newCategory = await treasuryApi.categories.create({ ...data, churchId });
            invalidateAll();
            toast.success('Categoría creada correctamente');
            return newCategory;
        } catch (err: any) {
            setCreateError(err.message || 'Error creating category');
            toast.error(err.message || 'Error al crear la categoría');
            throw err;
        } finally {
            setIsCreating(false);
        }
    };

    const updateCategory = async (id: string, data: UpdateCategoryDto) => {
        setIsCreating(true);
        try {
            await treasuryApi.categories.update(id, data);
            invalidateAll();
            toast.success('Categoría actualizada correctamente');
        } catch (err: any) {
            setCreateError(err.message || 'Error updating category');
            toast.error(err.message || 'Error al actualizar la categoría');
            throw err;
        } finally {
            setIsCreating(false);
        }
    };

    const deleteCategory = async (id: string) => {
        setIsCreating(true);
        try {
            await treasuryApi.categories.delete(id);
            invalidateAll();
            toast.success('Categoría eliminada correctamente');
        } catch (err: any) {
            setCreateError(err.message || 'Error deleting category');
            toast.error(err.message || 'Error al eliminar la categoría');
            throw err;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        categories,
        isLoading,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        isCreating,
        createError,
        refetch: mutate
    };
}
