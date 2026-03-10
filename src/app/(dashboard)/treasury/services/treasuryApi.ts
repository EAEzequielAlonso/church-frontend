/**
 * Servicio Centralizado para Tesorería
 * Encapsula todas las llamadas HTTP y el paso del JWT Token.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

/**
 * Wrapper tipado para hacer peticiones HTTP con auth token.
 */
export async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

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
        } catch {
            // Ignorar
        }

        throw new Error(errorMessage);
    }

    // Manejar respuestas vacías (ej. DELETE 204 No Content)
    if (response.status === 204) {
        return {} as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json();
    } else {
        const text = await response.text();
        return (text ? JSON.parse(text) : {}) as T;
    }
}

/**
 * Helper genérico para armar query strings.
 */
export function buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, value.toString());
        }
    });
    const result = query.toString();
    return result ? `?${result}` : '';
}

export const treasuryApi = {
    // === TRANSACTIONS ===
    transactions: {
        getAll: (churchId: string, params?: any) =>
            fetchWithAuth<any>(`/treasury/transactions${buildQueryString({ ...params, churchId })}`),

        create: (data: any) =>
            fetchWithAuth<any>('/treasury/transactions', { method: 'POST', body: JSON.stringify(data) }),

        update: (id: string, data: any) =>
            fetchWithAuth<any>(`/treasury/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

        delete: (id: string) =>
            fetchWithAuth<void>(`/treasury/transactions/${id}`, { method: 'DELETE' }),

        correct: (id: string, data: any) =>
            fetchWithAuth<any>(`/treasury/transactions/${id}/correct`, { method: 'POST', body: JSON.stringify(data) }),
    },

    // === ACCOUNTS ===
    accounts: {
        getAll: (churchId: string) =>
            fetchWithAuth<any[]>(`/treasury/accounts${buildQueryString({ churchId })}`),

        create: (data: any) =>
            fetchWithAuth<any>('/treasury/accounts', { method: 'POST', body: JSON.stringify(data) }),

        update: (id: string, data: any) =>
            fetchWithAuth<any>(`/treasury/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

        delete: (id: string) =>
            fetchWithAuth<void>(`/treasury/accounts/${id}`, { method: 'DELETE' }),
    },

    // === CATEGORIES ===
    categories: {
        getAll: (churchId: string, type?: string) =>
            fetchWithAuth<any[]>(`/treasury/categories${buildQueryString({ churchId, type })}`),

        create: (data: any) =>
            fetchWithAuth<any>('/treasury/categories', { method: 'POST', body: JSON.stringify(data) }),

        update: (id: string, data: any) =>
            fetchWithAuth<any>(`/treasury/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

        delete: (id: string) =>
            fetchWithAuth<void>(`/treasury/categories/${id}`, { method: 'DELETE' }),
    },

    // === BUDGETS ===
    budgets: {
        getAll: (churchId: string, year?: number, month?: number) =>
            fetchWithAuth<any[]>(`/treasury/budgets${buildQueryString({ churchId, year, month })}`),

        create: (data: any) =>
            fetchWithAuth<any>('/treasury/budgets', { method: 'POST', body: JSON.stringify(data) }),

        delete: (id: string) =>
            fetchWithAuth<void>(`/treasury/budgets/${id}`, { method: 'DELETE' }),

        getExecution: (churchId: string, year: number, month: number) =>
            fetchWithAuth<any>(`/treasury/budgets/execution${buildQueryString({ churchId, year, month })}`),
    },

    // === PERIODS ===
    periods: {
        getAll: (churchId: string, year?: number) =>
            fetchWithAuth<any[]>(`/treasury/periods${buildQueryString({ churchId, year })}`),

        close: (churchId: string, data: any) =>
            fetchWithAuth<any>('/treasury/periods/close', { method: 'POST', body: JSON.stringify({ ...data, churchId }) }),

        reopen: (churchId: string, data: any) =>
            fetchWithAuth<any>('/treasury/periods/reopen', { method: 'POST', body: JSON.stringify({ ...data, churchId }) }),
    },

    // === REPORTS ===
    reports: {
        getSummary: (churchId: string, startDate?: string, endDate?: string) =>
            fetchWithAuth<any>(`/treasury/reports/summary${buildQueryString({ churchId, startDate, endDate })}`),

        getCashflow: (churchId: string, startDate?: string, endDate?: string) =>
            fetchWithAuth<any>(`/treasury/reports/cashflow${buildQueryString({ churchId, startDate, endDate })}`),

        getCategoryBreakdown: (churchId: string, type?: string, startDate?: string, endDate?: string) =>
            fetchWithAuth<any>(`/treasury/reports/category-breakdown${buildQueryString({ churchId, type, startDate, endDate })}`),

        getMinistryBreakdown: (churchId: string, startDate?: string, endDate?: string) =>
            fetchWithAuth<any>(`/treasury/reports/ministry-breakdown${buildQueryString({ churchId, startDate, endDate })}`),

        getAccountBalances: (churchId: string) =>
            fetchWithAuth<any>(`/treasury/reports/account-balances${buildQueryString({ churchId })}`),

        getTrendAnalysis: (churchId: string, months?: number) =>
            fetchWithAuth<any>(`/treasury/reports/trends${buildQueryString({ churchId, months })}`),

        downloadPPT: async (churchId: string): Promise<Blob> => {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/treasury/reports/ppt?churchId=${churchId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Error al descargar reporte');
            return response.blob();
        }
    },

    // === AUDIT ===
    audit: {
        getLogs: (churchId: string, entityType?: string, entityId?: string, action?: string, limit?: number, page?: number) =>
            fetchWithAuth<any>(`/treasury/audit${buildQueryString({ churchId, entityType, entityId, action, limit, page })}`),
    }
};
