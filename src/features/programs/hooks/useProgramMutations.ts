import { useState } from 'react';
import { programsApi } from '../api/programs.api';
import { CreateProgramDto, UpdateProgramDto, ProgramStatus } from '../types/program.types';
import { toast } from 'sonner';

export function useProgramMutations() {
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const createProgram = async (data: CreateProgramDto, onSuccess?: () => void) => {
        setIsCreating(true);
        try {
            await programsApi.create(data);
            toast.success('Programa creado correctamente');
            onSuccess?.();
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al crear programa');
            return false;
        } finally {
            setIsCreating(false);
        }
    };

    const updateProgram = async (id: string, data: UpdateProgramDto, onSuccess?: () => void) => {
        setIsUpdating(true);
        try {
            await programsApi.update(id, data);
            toast.success('Programa actualizado');
            onSuccess?.();
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al actualizar programa');
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const deleteProgram = async (id: string, onSuccess?: () => void) => {
        setIsDeleting(true);
        try {
            await programsApi.delete(id);
            toast.success('Programa eliminado');
            onSuccess?.();
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al eliminar programa');
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    const changeStatus = async (id: string, status: ProgramStatus, onSuccess?: () => void) => {
        // Optimistic UI updates could be handled by SWR mutate in parent, but simple async here
        try {
            await programsApi.update(id, { status });
            toast.success(`Estado cambiado a ${status}`);
            onSuccess?.();
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al cambiar estado');
            return false;
        }
    };

    return {
        createProgram,
        updateProgram,
        deleteProgram,
        changeStatus,
        isCreating,
        isUpdating,
        isDeleting
    };
}
