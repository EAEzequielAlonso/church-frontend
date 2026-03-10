import { LoanStatus } from '../types/library.types';

export const LOAN_STATUS_LABELS: Record<LoanStatus | 'ALL', string> = {
    'ALL': 'Todos',
    'REQUESTED': 'Solicitado',
    'APPROVED': 'Aprobado',
    'DELIVERED': 'Entregado (Activo)',
    'RETURNED': 'Devuelto',
    'REJECTED': 'Rechazado',
    'CANCELLED': 'Cancelado',
};

export const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
    'REQUESTED': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    'APPROVED': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    'DELIVERED': 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100',
    'RETURNED': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    'REJECTED': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    'CANCELLED': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
};

