import useSWR, { mutate } from "swr";
import * as api from "../api/budget.api";
import { useAuth } from "@/context/AuthContext";
import { CreateBudgetPeriodDto } from "../types/budget.types";
import { toast } from "sonner";

export function useBudgetPeriods(year?: number) {
    const { churchId } = useAuth();

    // Only fetch if we have a churchId
    const key = churchId ? `/budget/periods?churchId=${churchId}&year=${year || ''}` : null;

    const { data, error, isLoading } = useSWR(key, () => api.getBudgetPeriods(churchId!, year));

    const createPeriod = async (data: any) => {
        try {
            await api.createBudgetPeriod(data);
            await mutate(key);
            toast.success("Periodo creado exitosamente");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Error al crear periodo");
            return false;
        }
    };

    const updatePeriod = async (id: string, data: any) => {
        try {
            await api.updateBudgetPeriod(id, data);
            await mutate(key);
            toast.success("Periodo actualizado");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar periodo");
            return false;
        }
    };

    const deletePeriod = async (id: string) => {
        try {
            await api.deleteBudgetPeriod(id);
            await mutate(key);
            toast.success("Periodo eliminado");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar periodo");
            return false;
        }
    };

    return {
        periods: data || [],
        isLoading,
        error,
        createPeriod,
        updatePeriod,
        deletePeriod
    };
}
