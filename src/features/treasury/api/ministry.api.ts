
import { MinistryDto } from '../types/ministry.types';

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
        throw new Error('Error al cargar ministerios');
    }

    return response.json();
}

export const getMinistries = async (churchId: string): Promise<MinistryDto[]> => {
    return fetchWithAuth(`/ministries?churchId=${churchId}`);
};
