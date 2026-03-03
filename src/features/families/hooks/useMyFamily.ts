import useSWR from 'swr';
import { familiesApi } from '../api/families.api';
import { toast } from 'sonner';

export function useMyFamily(memberId?: string) {
    const { data, error, isLoading, mutate } = useSWR(
        memberId ? `/families/my-family` : null,
        () => familiesApi.getMyFamily(),
        {
            revalidateOnFocus: false,
            onError: (err) => {
                // Ignore 404 since it just means they don't have a family
                if (err.response?.status !== 404) {
                    console.error('Error fetching my family', err);
                }
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
