import { useState } from 'react';
import { groupsApi } from '../api/groups.api';
import { UpdateGroupDto, GroupDto } from '../types/group.types';

export function useUpdateGroup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateGroup = async (id: string, payload: UpdateGroupDto): Promise<GroupDto> => {
        setIsLoading(true);
        setError(null);
        try {
            const updated = await groupsApi.update(id, payload);
            return updated;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al actualizar el grupo';
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateGroup,
        isLoading,
        error
    };
}
