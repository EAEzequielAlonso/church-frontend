import useSWR from 'swr';
import { groupsApi } from '../api/groups.api';
import { GroupType } from '../types/group.types';

export function useGroups(type?: GroupType | 'ALL') {
    // If 'ALL' is passed, we fetch everything (type = undefined)
    const effectiveType = type === 'ALL' ? undefined : type;
    const key = effectiveType ? `/groups?type=${effectiveType}` : '/groups';

    const fetcher = async () => {
        return await groupsApi.getAll(effectiveType);
    };

    const { data: groups, error, isLoading, mutate } = useSWR(key, fetcher, {
        revalidateOnFocus: true,
        fallbackData: []
    });

    return {
        groups: groups || [],
        isLoading,
        error,
        refetch: mutate
    };
}
