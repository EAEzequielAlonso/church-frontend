import { CreateTransactionDto, UpdateTransactionDto, CreateAccountDto, TreasuryTransactionDto, TreasuryAccountDto } from '../types/treasury.types';

import { format } from 'date-fns';

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
        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('churchId');
            window.location.href = '/login';
            throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        }

        let errorMessage = 'Error en la solicitud';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) { }

        throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return response.text().then(text => text ? JSON.parse(text) : {});
    }
}

// --- Transactions ---

export interface TransactionFilters {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    categoryId?: string;
    accountId?: string;
    limit?: number;
    page?: number;
    deleted?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        limit: number;
    };
}

export const getTransactions = async (churchId: string, filters: TransactionFilters = {}): Promise<PaginatedResponse<TreasuryTransactionDto>> => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', format(filters.startDate, 'yyyy-MM-dd'));
    if (filters.endDate) params.append('endDate', format(filters.endDate, 'yyyy-MM-dd'));
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.accountId) params.append('accountId', filters.accountId);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.deleted) params.append('deleted', 'true');

    // The backend now returns { data, meta }
    return fetchWithAuth(`/treasury/transactions?${params.toString()}`);
};

export const createTransaction = async (data: CreateTransactionDto): Promise<TreasuryTransactionDto> => {
    return fetchWithAuth('/treasury/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateTransaction = async (id: string, data: UpdateTransactionDto): Promise<TreasuryTransactionDto> => {
    return fetchWithAuth(`/treasury/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const deleteTransaction = async (id: string): Promise<void> => {
    return fetchWithAuth(`/treasury/transactions/${id}`, {
        method: 'DELETE',
    });
};

// --- Accounts ---

export const getAccounts = async (churchId: string): Promise<TreasuryAccountDto[]> => {
    return fetchWithAuth('/treasury/accounts');
};

export const createAccount = async (data: CreateAccountDto): Promise<TreasuryAccountDto> => {
    return fetchWithAuth('/treasury/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateAccount = async (id: string, data: Partial<CreateAccountDto>): Promise<TreasuryAccountDto> => {
    return fetchWithAuth(`/treasury/accounts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const deleteAccount = async (id: string): Promise<void> => {
    return fetchWithAuth(`/treasury/accounts/${id}`, {
        method: 'DELETE',
    });
};

export const getReportPPT = async (churchId: string): Promise<Blob> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/treasury/reports/ppt?churchId=${churchId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Error al descargar reporte');
    }

    return response.blob();
};

// --- Categories ---

export const getTransactionCategories = async (churchId: string, type?: 'income' | 'expense'): Promise<any[]> => {
    let url = `/treasury/categories?churchId=${churchId}`;
    if (type) url += `&type=${type}`;
    return fetchWithAuth(url);
};

export const createTransactionCategory = async (data: any): Promise<any> => {
    return fetchWithAuth('/treasury/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};
// --- Budgets ---

export const getBudgets = async (churchId: string, year?: number): Promise<any[]> => {
    let url = `/treasury/budgets?churchId=${churchId}`;
    if (year) url += `&year=${year}`;
    return fetchWithAuth(url);
};
