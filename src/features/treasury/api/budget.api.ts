
import { BudgetModel, CreateBudgetDto } from '../types/budget.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        throw new Error('Error en la solicitud de presupuestos');
    }

    return response.json();
}

export const getBudgets = async (churchId: string, year?: number): Promise<BudgetModel[]> => {
    let url = `/treasury/budgets?churchId=${churchId}`;
    if (year) url += `&year=${year}`;
    return fetchWithAuth(url);
};

export const createBudget = async (data: CreateBudgetDto): Promise<BudgetModel> => {
    return fetchWithAuth('/treasury/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const deleteBudget = async (id: string): Promise<void> => {
    return fetchWithAuth(`/treasury/budgets/${id}`, {
        method: 'DELETE',
    });
};
