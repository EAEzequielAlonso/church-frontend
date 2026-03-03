import useSWR from 'swr';
import api from '@/lib/api';
import { ChurchPersonDto } from '../types/group.types';
// Asumiendo que ChurchPersonDto define la forma general de una persona. 

export function useChurchPersons() {
    const fetcher = async () => {
        const res = await api.get('/members');
        return res.data;
    };

    const { data: persons, error, isLoading } = useSWR('/members', fetcher, {
        revalidateOnFocus: false
    });

    return {
        persons: (persons || []) as ChurchPersonDto[],
        isLoading,
        error
    };
}
