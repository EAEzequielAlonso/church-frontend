import useSWR from 'swr';
import { familiesApi } from '../api/families.api';
import { toast } from 'sonner';

export function useFamily(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        id ? `/families/${id}` : null,
        () => familiesApi.getById(id!),
        {
            revalidateOnFocus: false,
            onError: (err) => {
                toast.error('Error al cargar detalle de familia');
                console.error(err);
            }
        }
    );

    return {
        family: data,
        isLoading,
        error,
        mutate
    };
}
