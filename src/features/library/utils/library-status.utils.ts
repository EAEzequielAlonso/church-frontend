import { BookStatus, LoanStatus } from '../types/library.types';
import type { ReactNode } from 'react';

// ─── BookStatus UI ──────────────────────────────────────────────────────────

export interface BookStatusUI {
    label: string;
    /** Tailwind classes for the badge */
    badgeClass: string;
}

const BOOK_STATUS_UI: Record<BookStatus, BookStatusUI> = {
    AVAILABLE: {
        label: 'Disponible',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    RESERVED: {
        label: 'Reservado',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    LOANED: {
        label: 'Prestado',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
    },
    REMOVED: {
        label: 'Retirado',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
    },
};

export function getBookStatusUI(status: BookStatus): BookStatusUI {
    return BOOK_STATUS_UI[status] ?? { label: status, badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
}

// ─── LoanStatus UI ──────────────────────────────────────────────────────────

export interface LoanStatusUI {
    /** Short user-facing label */
    label: string;
    /** Longer actionable description */
    description: string;
    /** Tailwind classes for the badge */
    badgeClass: string;
}

const LOAN_STATUS_UI: Record<LoanStatus, LoanStatusUI> = {
    REQUESTED: {
        label: 'Pendiente',
        description: 'Esperando aprobación',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    APPROVED: {
        label: 'Aprobado',
        description: 'Aprobado – pendiente entrega',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    DELIVERED: {
        label: 'Entregado',
        description: 'En poder del solicitante',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    RETURNED: {
        label: 'Devuelto',
        description: 'Devuelto correctamente',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    REJECTED: {
        label: 'Rechazado',
        description: 'Solicitud rechazada',
        badgeClass: 'bg-red-100 text-red-700 border-red-200',
    },
    CANCELLED: {
        label: 'Cancelado',
        description: 'Solicitud cancelada',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
    },
};

export function getLoanStatusUI(status: LoanStatus): LoanStatusUI {
    return LOAN_STATUS_UI[status] ?? {
        label: status,
        description: status,
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    };
}

/** Helper to check if a loan is considered "active" (not yet finished). */
export const ACTIVE_LOAN_STATUSES: LoanStatus[] = ['REQUESTED', 'APPROVED', 'DELIVERED'];

/** Status filter options for the LIBRARIAN management view. */
export const LOAN_STATUS_FILTER_OPTIONS: { value: LoanStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todos' },
    { value: 'REQUESTED', label: 'Pendientes' },
    { value: 'APPROVED', label: 'Aprobados' },
    { value: 'DELIVERED', label: 'Entregados' },
    { value: 'RETURNED', label: 'Devueltos' },
    { value: 'REJECTED', label: 'Rechazados' },
    { value: 'CANCELLED', label: 'Cancelados' },
];
