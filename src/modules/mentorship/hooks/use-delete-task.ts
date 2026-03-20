import useSWRMutation from 'swr/mutation';
import { mentorshipService } from '../services/mentorship.service';
import { useSWRConfig } from 'swr';

async function deleteTaskRequest(
    url: string,
    { arg }: { arg: { taskId: string } }
) {
    return mentorshipService.deleteTask(arg.taskId);
}

export function useDeleteTask() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error } = useSWRMutation(
        '/mentorship/tasks/delete',
        deleteTaskRequest
    );

    const deleteTask = async (args: { mentorshipId: string, taskId: string }) => {
        const result = await trigger({ taskId: args.taskId });
        mutate(`/mentorship/${args.mentorshipId}`);
        return result;
    };

    return {
        deleteTask,
        isMutating,
        error
    };
}
