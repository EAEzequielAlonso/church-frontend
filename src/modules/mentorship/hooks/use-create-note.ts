import useSWRMutation from 'swr/mutation';
import { mentorshipService } from '../services/mentorship.service';
import { CreateMentorshipNoteDto } from '../types/mentorship.types';
import { useSWRConfig } from 'swr';

async function createNoteFetcher(
    url: string,
    { arg }: { arg: { mentorshipId: string, payload: CreateMentorshipNoteDto } }
) {
    return mentorshipService.createNote(arg.mentorshipId, arg.payload);
}

export function useCreateNote() {
    const { mutate } = useSWRConfig();

    const mutation = useSWRMutation('/mentorship/note/create', createNoteFetcher);

    const createNote = async (args: { mentorshipId: string, payload: CreateMentorshipNoteDto }) => {
        const result = await mutation.trigger(args);
        mutate(`/mentorship/${args.mentorshipId}`);
        return result;
    };

    return {
        createNote,
        isMutating: mutation.isMutating,
        error: mutation.error
    };
}
