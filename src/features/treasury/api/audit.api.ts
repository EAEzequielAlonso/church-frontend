
import { TreasuryAuditLogModel } from '../types/audit.types';

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
        throw new Error('Error al cargar auditoría');
    }

    return response.json();
}

export const getAuditLogs = async (transactionId: string): Promise<TreasuryAuditLogModel[]> => {
    return fetchWithAuth(`/treasury/transactions/${transactionId}/audit`);
};
