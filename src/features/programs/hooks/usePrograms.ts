import useSWR from 'swr';
import { programsApi } from '../api/programs.api';
import { ProgramCategory, ProgramDto } from '../types/program.types';
import { toast } from 'sonner';

export function usePrograms(category: ProgramCategory) {
    const { data, error, isLoading, mutate } = useSWR(
        `/programs?type=${category}`,
        () => programsApi.getAll(category),
        {
            revalidateOnFocus: false,
            onError: (err) => {
                toast.error('Error al cargar programas');
                console.error(err);
            }
        }
    );

    return {
        programs: data,
        isLoading,
        error,
        mutate
    };
}
