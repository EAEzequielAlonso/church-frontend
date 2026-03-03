'use client';
import React, { useState } from 'react';
import { useLoans, useLibraryMutations, useMyBookLoans } from '../hooks/useLibrary';
import { LoanStatus } from '../types/library.types';
import { getLoanStatusUI, LOAN_STATUS_FILTER_OPTIONS } from '../utils/library-status.utils';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Check, X, Package, RotateCcw, Loader2, Building2, User, AlertTriangle, Info } from 'lucide-react';
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

type FilterVal = LoanStatus | 'ALL';

interface ConfirmState {
    type: 'approve' | 'reject' | 'deliver' | 'return' | null;
    loanId?: string;
}

const ACTIVE_LOAN_STATUSES: LoanStatus[] = ['REQUESTED', 'APPROVED', 'DELIVERED'];
const TERMINAL_STATUSES = new Set(['RETURNED', 'REJECTED', 'CANCELLED']);

export function LoanManagement() {
    const { user } = useAuth();
    const isLibrarian = user?.roles?.includes('LIBRARIAN');

    const [filter, setFilter] = useState<FilterVal>('ALL');

    // Librarians use the full /loans endpoint; owners use the /my-book-loans endpoint
    const librarianLoans = useLoans({ status: filter === 'ALL' ? undefined : filter });
    const myBookLoans = useMyBookLoans();

    const { data: rawLoans = [], isLoading, error } = isLibrarian ? librarianLoans : myBookLoans;

    // When showing ALL, exclude terminal states — those belong to Historial
    const loans = (filter === 'ALL'
        ? (rawLoans as any[]).filter(l => !TERMINAL_STATUSES.has(l.status))
        : rawLoans) as typeof rawLoans;

    const { approveLoan, rejectLoan, deliverLoan, returnLoan } = useLibraryMutations();

    const [confirm, setConfirm] = useState<ConfirmState>({ type: null });
    const [returnCondition, setReturnCondition] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const act = async (type: ConfirmState['type'], loanId: string, extra?: string) => {
        setLoadingId(loanId);
        try {
            if (type === 'approve') await approveLoan.mutateAsync(loanId);
            if (type === 'reject') await rejectLoan.mutateAsync(loanId);
            if (type === 'deliver') await deliverLoan.mutateAsync({ id: loanId });
            if (type === 'return') await returnLoan.mutateAsync({ id: loanId, condition: extra });
            toast.success('Acción registrada correctamente');
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'Error al procesar la acción');
        } finally {
            setLoadingId(null);
            setReturnCondition('');
            setConfirm({ type: null });
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
                <AlertDescription>No se pudieron cargar los préstamos. Intentá recargar la página.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Gestión de Préstamos</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Vista exclusiva del Bibliotecario.</p>
                </div>
                <Select value={filter} onValueChange={(val) => setFilter(val as FilterVal)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Filtrar estado" />
                    </SelectTrigger>
                    <SelectContent>
                        {LOAN_STATUS_FILTER_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loans.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No hay préstamos en este estado.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loans.map(loan => {
                        const ui = getLoanStatusUI(loan.status as LoanStatus);
                        const isChurch = loan.book?.ownershipType === 'CHURCH';
                        const isThisLoading = loadingId === loan.id;
                        const isBookOwner = !isChurch && loan.book?.ownerMemberId === user?.memberId;
                        // Can manage: librarian for church books, or book owner for personal books
                        const canManage = (isChurch && isLibrarian) || isBookOwner;

                        return (
                            <Card key={loan.id} className="flex flex-col border-slate-200">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        {/* Status badge from central util */}
                                        <span className={`text-xs font-medium border px-2.5 py-1 rounded-full ${ui.badgeClass}`}>
                                            {ui.label}
                                        </span>
                                        {/* Ownership badge */}
                                        {isChurch ? (
                                            <span className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                                <Building2 className="w-3 h-3" /> Institucional
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                                <User className="w-3 h-3" />
                                                {loan.book?.ownerMember?.person?.fullName ?? 'Personal'}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-sm font-bold mt-2 line-clamp-1">{loan.book?.title}</CardTitle>
                                    <p className="text-xs text-slate-500">
                                        Solicitante: {loan.borrower?.person?.fullName ?? '—'}
                                    </p>
                                    {loan.requestedAt && (
                                        <p className="text-xs text-slate-400">
                                            {format(new Date(loan.requestedAt), "d MMM yyyy", { locale: es })}
                                        </p>
                                    )}
                                </CardHeader>

                                <CardContent className="flex-grow space-y-2">
                                    {loan.dueDate && (
                                        <p className="text-xs text-slate-600 flex justify-between">
                                            <span>Vence:</span>
                                            <span>{format(new Date(loan.dueDate), 'dd MMM yyyy', { locale: es })}</span>
                                        </p>
                                    )}
                                    {/* Informational alert: shown only to LIBRARIAN viewing a MEMBER book loan */}
                                    {!isChurch && loan.status === 'REQUESTED' && isLibrarian && !isBookOwner && (
                                        <Alert className="py-2 px-3 border-amber-200 bg-amber-50">
                                            <Info className="h-3 w-3 text-amber-600" />
                                            <AlertDescription className="text-xs text-amber-700 ml-1">
                                                La aprobación corresponde al dueño del libro.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>

                                <CardFooter className="flex gap-2 justify-end flex-wrap pt-2">
                                    {loan.status === 'REQUESTED' && canManage && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => setConfirm({ type: 'reject', loanId: loan.id })}
                                                disabled={!!loadingId}
                                            >
                                                <X className="h-4 w-4 mr-1" /> Rechazar
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => setConfirm({ type: 'approve', loanId: loan.id })}
                                                disabled={!!loadingId}
                                            >
                                                <Check className="h-4 w-4 mr-1" /> Aprobar
                                            </Button>
                                        </>
                                    )}

                                    {loan.status === 'APPROVED' && canManage && (
                                        <Button
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                            onClick={() => setConfirm({ type: 'deliver', loanId: loan.id })}
                                            disabled={!!loadingId}
                                        >
                                            {isThisLoading
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : <><Package className="h-4 w-4 mr-1" /> Marcar Entregado</>
                                            }
                                        </Button>
                                    )}

                                    {loan.status === 'DELIVERED' && canManage && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setConfirm({ type: 'return', loanId: loan.id })}
                                            disabled={!!loadingId}
                                        >
                                            {isThisLoading
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : <><RotateCcw className="h-4 w-4 mr-1" /> Recibir Devolución</>
                                            }
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ── Confirm Modals ── */}
            <AlertDialog open={confirm.type === 'approve'} onOpenChange={(o) => !o && setConfirm({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Aprobar solicitud?</AlertDialogTitle>
                        <AlertDialogDescription>El libro quedará reservado para este solicitante.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700" onClick={() => act('approve', confirm.loanId!)}>
                            Aprobar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirm.type === 'reject'} onOpenChange={(o) => !o && setConfirm({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Rechazar solicitud?</AlertDialogTitle>
                        <AlertDialogDescription>El libro permanecerá disponible para otros.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => act('reject', confirm.loanId!)}>
                            Rechazar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirm.type === 'deliver'} onOpenChange={(o) => !o && setConfirm({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Marcar como entregado?</AlertDialogTitle>
                        <AlertDialogDescription>El libro pasará a estado ENTREGADO físicamente al solicitante.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-indigo-600 hover:bg-indigo-700" onClick={() => act('deliver', confirm.loanId!)}>
                            Confirmar entrega
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirm.type === 'return'} onOpenChange={(o) => !o && setConfirm({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar devolución</AlertDialogTitle>
                        <AlertDialogDescription>El libro volverá a estar disponible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-6 pb-2">
                        <Label className="text-sm text-slate-600 mb-1.5 block">
                            Observación del estado (opcional)
                        </Label>
                        <Textarea
                            placeholder="Ej: Buen estado, leve desgaste en tapa..."
                            value={returnCondition}
                            onChange={(e) => setReturnCondition(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setReturnCondition('')}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-slate-800 hover:bg-slate-900"
                            onClick={() => act('return', confirm.loanId!, returnCondition || undefined)}
                        >
                            Confirmar devolución
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
