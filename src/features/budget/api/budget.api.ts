import axios from "@/lib/axios";
import {
    BudgetPeriod,
    CreateBudgetPeriodDto,
    BudgetAllocation,
    CreateBudgetAllocationDto,
    BudgetExecutionResponse
} from "../types/budget.types";

export const getBudgetPeriods = async (churchId: string, year?: number): Promise<BudgetPeriod[]> => {
    const { data } = await axios.get('/budget/periods', { params: { year } });
    return data;
};

export const createBudgetPeriod = async (dto: CreateBudgetPeriodDto): Promise<BudgetPeriod> => {
    const { data } = await axios.post('/budget/periods', dto);
    return data;
};

export const updateBudgetPeriod = async (id: string, dto: Partial<CreateBudgetPeriodDto>): Promise<BudgetPeriod> => {
    const { data } = await axios.patch(`/budget/periods/${id}`, dto);
    return data;
};

export const deleteBudgetPeriod = async (id: string): Promise<void> => {
    await axios.delete(`/budget/periods/${id}`);
};

export const getBudgetAllocations = async (churchId: string, periodId: string): Promise<BudgetAllocation[]> => {
    const { data } = await axios.get('/budget/allocations', { params: { periodId } });
    return data;
};

export const createBudgetAllocation = async (dto: CreateBudgetAllocationDto): Promise<BudgetAllocation> => {
    const { data } = await axios.post('/budget/allocations', dto);
    return data;
};

export const updateBudgetAllocation = async (id: string, dto: Partial<CreateBudgetAllocationDto>): Promise<BudgetAllocation> => {
    const { data } = await axios.patch(`/budget/allocations/${id}`, dto);
    return data;
};

export const deleteBudgetAllocation = async (id: string): Promise<void> => {
    await axios.delete(`/budget/allocations/${id}`);
};

export const getBudgetExecution = async (churchId: string, periodId: string): Promise<BudgetExecutionResponse> => {
    const { data } = await axios.get(`/budget/execution/${periodId}`);
    return data;
};
