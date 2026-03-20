import useSWR from 'swr';
import { GetMentorshipsParams, mentorshipService } from '../services/mentorship.service';
import { PaginatedMentorshipResponse } from '../types/mentorship.types';

export function useMentorshipInvitations(filters: GetMentorshipsParams = {}) {
    const key = ['/mentorship/invitations', filters.page, filters.limit];

    const { data, error, isLoading, mutate } = useSWR<PaginatedMentorshipResponse>(
        key,
        () => mentorshipService.getInvitations(filters),
        {
            revalidateOnFocus: true
        }
    );

    return {
        data: data?.data || [],
        total: data?.total || 0,
        isLoading,
        isError: !!error,
        mutate
    };
}
