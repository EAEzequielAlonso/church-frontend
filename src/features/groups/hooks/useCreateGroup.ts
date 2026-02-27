import { useState } from 'react';
import { groupsApi } from '../api/groups.api';
import { CreateGroupDto, GroupDto } from '../types/group.types';

export function useCreateGroup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createGroup = async (payload: CreateGroupDto): Promise<GroupDto> => {
        setIsLoading(true);
        setError(null);
        try {
            const newGroup = await groupsApi.create(payload);
            return newGroup;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al crear el grupo';
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createGroup,
        isLoading,
        error
    };
}
