import useSWR from 'swr';
import { familiesApi } from '../api/families.api';
import { toast } from 'sonner';

export function useFamilies() {
    const { data, error, isLoading, mutate } = useSWR(
        '/families',
        () => familiesApi.getAll(),
        {
            revalidateOnFocus: false,
            onError: (err) => {
                toast.error('Error al cargar familias');
                console.error(err);
            }
        }
    );

    return {
        families: data,
        isLoading,
        error,
        mutate
    };
}
