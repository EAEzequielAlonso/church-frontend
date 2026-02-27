import { LoanStatus } from '../types/library.types';

export const LOAN_STATUS_LABELS: Record<LoanStatus | 'ALL', string> = {
    'ALL': 'Todos',
    [LoanStatus.REQUESTED]: 'Solicitado',
    [LoanStatus.APPROVED]: 'Aprobado',
    [LoanStatus.DELIVERED]: 'Entregado (Activo)',
    [LoanStatus.RETURNED]: 'Devuelto',
    [LoanStatus.REJECTED]: 'Rechazado',
    [LoanStatus.CANCELLED]: 'Cancelado',
    [LoanStatus.ACTIVE]: 'Activo (Legacy)',
};

export const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
    [LoanStatus.REQUESTED]: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    [LoanStatus.APPROVED]: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    [LoanStatus.DELIVERED]: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100',
    [LoanStatus.RETURNED]: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    [LoanStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    [LoanStatus.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    [LoanStatus.ACTIVE]: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
};
