import useSWRMutation from 'swr/mutation';
import { mentorshipService } from '../services/mentorship.service';
import { CreateMentorshipTaskDto } from '../types/mentorship.types';
import { useSWRConfig } from 'swr';

async function updateTaskRequest(
    url: string,
    { arg }: { arg: { taskId: string, payload: Partial<CreateMentorshipTaskDto> } }
) {
    return mentorshipService.updateTask(arg.taskId, arg.payload);
}

export function useUpdateTask() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error } = useSWRMutation(
        '/mentorship/tasks/update',
        updateTaskRequest
    );

    const updateTask = async (args: { mentorshipId: string, taskId: string, payload: Partial<CreateMentorshipTaskDto> }) => {
        const result = await trigger({ taskId: args.taskId, payload: args.payload });
        mutate(`/mentorship/${args.mentorshipId}`);
        return result;
    };

    return {
        updateTask,
        isMutating,
        error
    };
}
