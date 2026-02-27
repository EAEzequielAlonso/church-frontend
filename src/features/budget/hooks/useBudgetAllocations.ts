import useSWR, { mutate } from "swr";
import * as api from "../api/budget.api";
import { useAuth } from "@/context/AuthContext";
import { CreateBudgetAllocationDto } from "../types/budget.types";
import { toast } from "sonner";

export function useBudgetAllocations(periodId?: string) {
    const { churchId } = useAuth();

    const key = churchId && periodId ? `/budget/allocations?churchId=${churchId}&periodId=${periodId}` : null;

    const { data, error, isLoading } = useSWR(key, () => api.getBudgetAllocations(churchId!, periodId!));

    const createAllocation = async (dto: CreateBudgetAllocationDto) => {
        try {
            await api.createBudgetAllocation(dto);
            await mutate(key);
            // Also invalidate execution view needed? Yes usually.
            await mutate((k: string) => k.startsWith('/budget/execution'));

            toast.success("Asignación de presupuesto creada");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Error al asignar presupuesto");
            return false;
        }
    };

    const updateAllocation = async (id: string, dto: Partial<CreateBudgetAllocationDto>) => {
        try {
            await api.updateBudgetAllocation(id, dto);
            await mutate(key);
            await mutate((k: string) => k.startsWith('/budget/execution'));
            toast.success("Asignación actualizada");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar asignación");
            return false;
        }
    };

    const deleteAllocation = async (id: string) => {
        try {
            await api.deleteBudgetAllocation(id);
            await mutate(key);
            await mutate((k: string) => k.startsWith('/budget/execution'));
            toast.success("Asignación eliminada");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar asignación");
            return false;
        }
    };

    return {
        allocations: data || [],
        isLoading,
        error,
        createAllocation,
        updateAllocation,
        deleteAllocation
    };
}
