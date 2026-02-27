import { useState } from 'react';
import { groupsApi } from '../api/groups.api';

export function useGroupMutations() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const enroll = async (groupId: string, churchPersonId: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await groupsApi.join(groupId, churchPersonId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al unirse');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const disenroll = async (groupId: string, churchPersonId: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await groupsApi.removeParticipant(groupId, churchPersonId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al salir');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const addParticipant = async (groupId: string, churchPersonId: string, role: import('../types/group.types').GroupRole): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await groupsApi.addParticipant(groupId, { churchPersonId, role });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al añadir participante');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        enroll,
        disenroll,
        addParticipant,
        isLoading,
        error
    };
}
