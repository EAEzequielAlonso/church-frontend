'use client';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMyLoans, useLoans } from '../hooks/useLibrary';
import { useAuth } from '@/context/AuthContext';
import { getLoanStatusUI } from '../utils/library-status.utils';
import { Loan } from '../types/library.types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, History, BookOpen, Calendar, RotateCcw } from 'lucide-react';

const HISTORY_STATUSES = new Set(['RETURNED', 'REJECTED', 'CANCELLED']);

function DateCell({ label, date }: { label: string; date?: string | null }) {
    if (!date) return <span className="text-slate-400 text-xs">—</span>;
    return (
        <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="text-xs font-medium text-slate-700">
                {format(new Date(date), 'dd MMM yyyy', { locale: es })}
            </p>
        </div>
    );
}

interface LoanRowProps {
    loan: Loan;
    showBorrower?: boolean;
    showOwner?: boolean;
}

function LoanRow({ loan, showBorrower, showOwner }: LoanRowProps) {
    const s = getLoanStatusUI(loan.status as any);
    const book = loan.book;

    return (
        <div className={`bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow ${HISTORY_STATUSES.has(loan.status) ? 'opacity-80' : ''
            }`}>
            {/* Book cover */}
            <div className="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                {book?.coverUrl
                    ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    : <BookOpen className="w-5 h-5 text-slate-400" />
                }
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{book?.title ?? 'Libro'}</p>
                <p className="text-sm text-slate-500">{book?.author}</p>

                {showBorrower && (loan.borrower as any)?.person?.fullName && (
                    <p className="text-xs text-slate-400 mt-0.5">
                        Solicitante: <span className="font-medium text-slate-600">{(loan.borrower as any).person.fullName}</span>
                    </p>
                )}
                {showOwner && book?.ownershipType === 'MEMBER' && (book.ownerMember as any)?.person?.fullName && (
                    <p className="text-xs text-slate-400 mt-0.5">
                        Dueño: <span className="font-medium text-slate-600">{(book.ownerMember as any).person.fullName}</span>
                    </p>
                )}
                {book?.ownershipType === 'CHURCH' && (
                    <p className="text-xs text-slate-400 mt-0.5">⛪ Libro institucional</p>
                )}
            </div>

            {/* Dates */}
            <div className="flex gap-4 sm:gap-8 shrink-0 text-right sm:text-left">
                <DateCell label="Entrega" date={loan.deliveredAt} />
                <DateCell label="Devolución" date={loan.returnedAt} />
            </div>

            {/* Status badge */}
            <Badge className={`shrink-0 text-xs ${s.badgeClass ?? ''}`} variant="outline">
                {s.label}
            </Badge>
        </div>
    );
}

type Filter = 'ALL' | 'ACTIVE' | 'HISTORY';

export function LoanHistory() {
    const { user } = useAuth();
    const isLibrarian = user?.roles?.includes('LIBRARIAN');
    const [filter, setFilter] = useState<Filter>('ALL');

    // LIBRARIAN sees all loans; members see only their own
    const memberLoans = useMyLoans();
    const allLoans = useLoans({});

    const { data, isLoading, error } = isLibrarian ? allLoans : memberLoans;

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    if (error) return (
        <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>No se pudo cargar el historial.</AlertDescription>
        </Alert>
    );

    const loans: Loan[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

    const filtered = filter === 'ALL'
        ? loans
        : filter === 'ACTIVE'
            ? loans.filter(l => !HISTORY_STATUSES.has(l.status))
            : loans.filter(l => HISTORY_STATUSES.has(l.status));

    const activeCount = loans.filter(l => !HISTORY_STATUSES.has(l.status)).length;
    const historyCount = loans.filter(l => HISTORY_STATUSES.has(l.status)).length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {isLibrarian ? 'Historial completo de préstamos' : 'Mi historial de préstamos'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {isLibrarian
                            ? `${loans.length} registros en total para toda la iglesia`
                            : `${loans.length} préstamos registrados`}
                    </p>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 flex-wrap">
                    {(['ALL', 'ACTIVE', 'HISTORY'] as Filter[]).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}>
                            {f === 'ALL' ? `Todos (${loans.length})` :
                                f === 'ACTIVE' ? `En curso (${activeCount})` :
                                    `Completados (${historyCount})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <RotateCcw className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">
                        {filter === 'ACTIVE' ? 'No hay préstamos activos' :
                            filter === 'HISTORY' ? 'Sin préstamos completados aún' :
                                'Sin historial de préstamos'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filtered.map(loan => (
                        <LoanRow
                            key={loan.id}
                            loan={loan}
                            showBorrower={isLibrarian}
                            showOwner={isLibrarian}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
