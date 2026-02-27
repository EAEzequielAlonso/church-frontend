import { useState, useEffect } from 'react';
import { TransactionCategory } from '../types/treasury.types';
import { getTransactionCategories, createTransactionCategory } from '../api/treasury.api';
import { useAuth } from '@/context/AuthContext';

export function useCategories(type?: 'income' | 'expense') {
    const { churchId } = useAuth();
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        if (!churchId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTransactionCategories(churchId, type);
            setCategories(data);
        } catch (err: any) {
            setError(err.message || 'Error loading categories');
        } finally {
            setIsLoading(false);
        }
    };

    const createCategory = async (data: any) => {
        if (!churchId) return;
        setIsLoading(true);
        try {
            await createTransactionCategory({ ...data, churchId });
            await fetchCategories();
        } catch (err: any) {
            setError(err.message || 'Error creating category');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [churchId, type]);

    return { categories, isLoading, error, refetch: fetchCategories, createCategory };
}
