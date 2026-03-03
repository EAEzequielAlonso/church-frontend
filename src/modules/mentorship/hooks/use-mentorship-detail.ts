import useSWR from 'swr';
import { mentorshipService } from '../services/mentorship.service';
import { MentorshipDetail } from '../types/mentorship-detail.types';

export function useMentorshipDetail(id: string) {
    const key = id ? `/mentorship/${id}` : null;

    const { data, error, isLoading, mutate } = useSWR<MentorshipDetail>(
        key,
        () => mentorshipService.getMentorshipById(id),
        {
            revalidateOnFocus: false
        }
    );

    return {
        data,
        isLoading,
        isError: !!error,
        error,
        mutate
    };
}
