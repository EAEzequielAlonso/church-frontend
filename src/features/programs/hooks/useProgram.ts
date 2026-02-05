import useSWR from 'swr';
import { programsApi } from '../api/programs.api';
import { toast } from 'sonner';

export function useProgram(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        id ? `/programs/${id}` : null,
        () => programsApi.getById(id!),
        {
            revalidateOnFocus: false,
            onError: (err) => {
                // Don't toast 404 if expected? Use fallback in UI.
                // toast.error('Error al cargar detalle del programa');
                console.error(err);
            }
        }
    );

    return {
        program: data,
        isLoading,
        error,
        mutate
    };
}
