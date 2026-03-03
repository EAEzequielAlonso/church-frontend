import useSWR from 'swr';
import { GetMentorshipsParams, mentorshipService } from '../services/mentorship.service';
import { PaginatedMentorshipResponse } from '../types/mentorship.types';

export function useMentorshipList(filters: GetMentorshipsParams) {
    const key = ['/mentorship', filters.page, filters.limit, filters.type, filters.status];

    const { data, error, isLoading, mutate } = useSWR<PaginatedMentorshipResponse>(
        key,
        () => mentorshipService.getMentorships(filters),
        {
            keepPreviousData: true,
            revalidateOnFocus: false
        }
    );

    return {
        data: data?.data || [],
        total: data?.total || 0,
        page: data?.page || filters.page || 1,
        limit: data?.limit || filters.limit || 10,
        isLoading,
        isError: !!error,
        error,
        mutate
    };
}
