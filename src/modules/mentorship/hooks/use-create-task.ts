import useSWRMutation from 'swr/mutation';
import { mentorshipService } from '../services/mentorship.service';
import { CreateMentorshipTaskDto } from '../types/mentorship.types';
import { useSWRConfig } from 'swr';

async function createTaskFetcher(
    url: string,
    { arg }: { arg: { mentorshipId: string, payload: CreateMentorshipTaskDto } }
) {
    return mentorshipService.createTask(arg.mentorshipId, arg.payload);
}

export function useCreateTask() {
    const { mutate } = useSWRConfig();

    const mutation = useSWRMutation('/mentorship/task/create', createTaskFetcher);

    const createTask = async (args: { mentorshipId: string, payload: CreateMentorshipTaskDto }) => {
        const result = await mutation.trigger(args);
        mutate(`/mentorship/${args.mentorshipId}`);
        return result;
    };

    return {
        createTask,
        isMutating: mutation.isMutating,
        error: mutation.error
    };
}
