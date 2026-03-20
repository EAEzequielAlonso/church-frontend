import { fetchWithAuth, buildQueryString } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { PeriodModel } from '../types/period.types';

export const periodsApi = {
    // Obtiene el estado del período particular. Siempre retorna un PeriodModel (si no existe en BD, el backend devuelve uno instanciado como OPEN).
    getPeriod: (churchId: string, year: number, month: number): Promise<PeriodModel> =>
        fetchWithAuth<PeriodModel>(`/treasury/periods/status${buildQueryString({ churchId, year, month })}`),

    // Cambiar estado a CLOSED y generar snapshot
    closePeriod: (churchId: string, year: number, month: number): Promise<PeriodModel> =>
        fetchWithAuth<PeriodModel>('/treasury/periods/close', {
            method: 'POST',
            body: JSON.stringify({ churchId, year, month })
        }),

    // Cambiar estado a OPEN y limpiar snapshot
    reopenPeriod: (churchId: string, year: number, month: number): Promise<PeriodModel> =>
        fetchWithAuth<PeriodModel>(`/treasury/periods/${year}/${month}/reopen`, {
            method: 'POST',
            body: JSON.stringify({ churchId, reason: 'Re-apertura manual' }) // Added placeholder reason as backend might require it
        })
};
