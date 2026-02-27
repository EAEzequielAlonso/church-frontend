import { useState } from 'react';
import { familiesApi } from '../api/families.api';
import { CreateFamilyDto } from '../types/family.types';
import { toast } from 'sonner';

export function useCreateFamily() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = async (data: CreateFamilyDto, onSuccess?: () => void) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await familiesApi.create(data);
            toast.success('Familia creada exitosamente');
            onSuccess?.();
            return result;
        } catch (err: any) {
            let msg = err.response?.data?.message;
            if (Array.isArray(msg)) {
                // If validation array, take the first one or join them
                // But specifically for 'Objects are not valid as React child' crash, verify it is string
                console.error('Validation errors:', msg);
                msg = 'Error de validación: Revise los campos requeridos (nombres de hijos, etc).';
            }
            if (typeof msg !== 'string') {
                msg = 'Error inesperado al crear familia';
            }

            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading, error };
}
