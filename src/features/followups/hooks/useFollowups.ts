import useSWR, { mutate } from 'swr';
import { followupApi } from '../api/followup.api';
import { FollowupStatus } from '../types/followup.types';

export function useFollowups(params?: {
    status?: FollowupStatus;
    assignedToPersonId?: string;
    search?: string;
    page?: number;
    limit?: number
}) {
    const key = ['/followups', params];
    const { data, error, isLoading, mutate: revalidate } = useSWR(key, () => followupApi.getAll(params));

    return {
        followups: data?.data || [],
        meta: data?.meta,
        isLoading,
        isError: error,
        mutate: revalidate
    };
}

export function useFollowupDetail(id: string) {
    const { data, error, isLoading, mutate } = useSWR(id ? `/followups/${id}` : null, () => followupApi.getOne(id));

    return {
        followup: data,
        isLoading,
        isError: error,
        mutate
    };
}

export function useFollowupNotes(id: string) {
    const { data, error, isLoading, mutate } = useSWR(id ? `/followups/${id}/notes` : null, () => followupApi.getNotes(id));

    return {
        notes: data || [],
        isLoading,
        isError: error,
        mutate
    };
}
