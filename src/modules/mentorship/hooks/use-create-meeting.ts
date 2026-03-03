import useSWRMutation from 'swr/mutation';
import { mentorshipService } from '../services/mentorship.service';
import { CreateMentorshipMeetingDto } from '../types/mentorship.types';
import { useSWRConfig } from 'swr';

async function createMeetingFetcher(
    url: string,
    { arg }: { arg: { mentorshipId: string, payload: CreateMentorshipMeetingDto } }
) {
    return mentorshipService.createMeeting(arg.mentorshipId, arg.payload);
}

export function useCreateMeeting() {
    const { mutate } = useSWRConfig();

    const mutation = useSWRMutation('/mentorship/meeting/create', createMeetingFetcher);

    const createMeeting = async (args: { mentorshipId: string, payload: CreateMentorshipMeetingDto }) => {
        const result = await mutation.trigger(args);
        mutate(`/mentorship/${args.mentorshipId}`);
        return result;
    };

    return {
        createMeeting,
        isMutating: mutation.isMutating,
        error: mutation.error
    };
}
