'use client';
import React, { useState } from 'react';
import { useMyLoans, useLibraryMutations } from '../hooks/useLibrary';
import { LoanStatus } from '../types/library.types';
import { getLoanStatusUI, ACTIVE_LOAN_STATUSES } from '../utils/library-status.utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Clock, Package, CheckCircle, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STATUS_ICON: Record<string, React.ElementType> = {
    REQUESTED: Clock,
    APPROVED: CheckCircle,
    DELIVERED: Package,
};

export function MyLoans() {
    const { data: loans = [], isLoading, error } = useMyLoans();
    const { cancelLoan } = useLibraryMutations();
    const [cancelTarget, setCancelTarget] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const activeLoans = loans.filter(l => ACTIVE_LOAN_STATUSES.includes(l.status as LoanStatus));

    const handleCancel = async (loanId: string) => {
        setLoadingId(loanId);
        try {
            await cancelLoan.mutateAsync(loanId);
            toast.success('Solicitud cancelada');
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'No se pudo cancelar la solicitud');
        } finally {
            setLoadingId(null);
            setCancelTarget(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    No se pudieron cargar tus préstamos. Intentá recargar la página.
                </AlertDescription>
            </Alert>
        );
    }

    if (activeLoans.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">No tenés préstamos activos</h3>
                <p className="text-slate-500 mt-1">Buscá libros disponibles en el Catálogo.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Mis Préstamos</h2>
                <p className="text-sm text-slate-500 mt-1">Solicitudes activas y libros en tu poder.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLoans.map((loan) => {
                    const ui = getLoanStatusUI(loan.status as LoanStatus);
                    const Icon = STATUS_ICON[loan.status] ?? BookOpen;
                    const isThisLoading = loadingId === loan.id;

                    return (
                        <div key={loan.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            {/* Book info */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{loan.book?.title ?? 'Libro'}</p>
                                    <p className="text-sm text-slate-500">{loan.book?.author}</p>
                                    {loan.book?.ownershipType === 'MEMBER' && loan.book?.ownerMember && (
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Dueño: {loan.book.ownerMember.person.fullName}
                                        </p>
                                    )}
                                </div>
                                {/* Status badge */}
                                <span className={`shrink-0 text-xs font-medium border px-2.5 py-1 rounded-full ${ui.badgeClass}`}>
                                    {ui.label}
                                </span>
                            </div>

                            {/* Status description */}
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                <Icon className="w-4 h-4 text-slate-400" />
                                <span>{ui.description}</span>
                            </div>

                            {/* Due date */}
                            {loan.dueDate && (
                                <p className="text-xs text-slate-400 mb-3">
                                    Vence: {format(new Date(loan.dueDate), "d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                            )}

                            {/* Cancel — only on REQUESTED */}
                            {loan.status === 'REQUESTED' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-red-500 border-red-200 hover:bg-red-50"
                                    disabled={isThisLoading || !!loadingId}
                                    onClick={() => setCancelTarget(loan.id)}
                                >
                                    {isThisLoading
                                        ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Cancelando...</>
                                        : <><XCircle className="w-4 h-4 mr-1.5" /> Cancelar solicitud</>
                                    }
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

            <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar solicitud?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tu solicitud será cancelada. Podrás volver a solicitarlo mientras esté disponible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleCancel(cancelTarget!)}
                        >
                            Cancelar solicitud
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
