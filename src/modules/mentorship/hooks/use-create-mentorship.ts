import useSWRMutation from 'swr/mutation';
import { mentorshipService } from '../services/mentorship.service';
import { CreateMentorshipDto } from '../types/mentorship.types';
import { useSWRConfig } from 'swr';

async function createMentorshipFetcher(
    url: string,
    { arg }: { arg: CreateMentorshipDto }
) {
    return mentorshipService.createMentorship(arg);
}

export function useCreateMentorship() {
    const { mutate } = useSWRConfig();

    // We use a dummy key for the mutation, as SWR mutation requires a string key.
    // However, after successful mutation, we tell SWR to invalidate the list key.
    const mutation = useSWRMutation('/mentorship/create', createMentorshipFetcher, {
        onSuccess: () => {
            // Invalidate the cache for the mentorship list so it fetches fresh data
            // We can use a mutator function or just mutate by partial key if supported,
            // or mutate the specific cached keys. A pattern is to mutate keys starting with '/mentorship'
            mutate(
                (key) => Array.isArray(key) && key[0] === '/mentorship',
                undefined,
                { revalidate: true }
            );
        }
    });

    return {
        create: mutation.trigger,
        isMutating: mutation.isMutating,
        error: mutation.error
    };
}
