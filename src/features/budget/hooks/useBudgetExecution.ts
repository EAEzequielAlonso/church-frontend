import useSWR from "swr";
import * as api from "../api/budget.api";
import { useAuth } from "@/context/AuthContext";

export function useBudgetExecution(periodId?: string) {
    const { churchId } = useAuth();

    const key = churchId && periodId ? `/budget/execution?churchId=${churchId}&periodId=${periodId}` : null;

    const { data, error, isLoading, mutate } = useSWR(key, () => api.getBudgetExecution(churchId!, periodId!));

    return {
        executionData: data,
        isLoading,
        error,
        mutate
    };
}
