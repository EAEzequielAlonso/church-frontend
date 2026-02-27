import useSWR from 'swr';
import { groupsApi } from '../api/groups.api';

export function useGroup(id: string | null) {
    const key = id ? `/groups/${id}` : null;

    const fetcher = async () => {
        if (!id) throw new Error("ID is required");
        return await groupsApi.getById(id);
    };

    const { data: group, error, isLoading, mutate } = useSWR(key, fetcher, {
        revalidateOnFocus: true
    });

    return {
        group,
        isLoading,
        error,
        refetch: mutate
    };
}
