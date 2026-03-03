'use client';
import React, { useState } from 'react';
import { useMyBookLoans, useMyOwnedBooks } from '../hooks/useLibrary';
import { useLibraryMutations } from '../hooks/useLibrary';
import { Loan } from '../types/library.types';
import { getLoanStatusUI } from '../utils/library-status.utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, User, CheckCircle, XCircle, RotateCcw, Trash2, Loader2, AlertTriangle, BookMarked } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmState {
    type: 'approve' | 'reject' | 'return' | 'delete' | null;
    loanId?: string;
    bookId?: string;
}

const ACTIVE_STATUSES = new Set(['REQUESTED', 'APPROVED', 'DELIVERED']);

export function MyBooks() {
    const { data: loans = [], isLoading: isLoadingLoans } = useMyBookLoans();
    const { data: booksData, isLoading: isLoadingBooks, error } = useMyOwnedBooks();
    const { approveLoan, rejectLoan, returnLoan, deleteBook } = useLibraryMutations();

    const [confirm, setConfirm] = useState<ConfirmState>({ type: null });
    const [returnCondition, setReturnCondition] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const isLoading = isLoadingLoans || isLoadingBooks;

    // Group active loans by book
    const loansByBook = loans
        .filter(l => ACTIVE_STATUSES.has(l.status))
        .reduce<Record<string, Loan[]>>((acc, l) => {
            const bookId = l.bookId ?? l.book?.id;
            if (bookId) {
                acc[bookId] = acc[bookId] ?? [];
                acc[bookId].push(l);
            }
            return acc;
        }, {});

    const allBooks = booksData?.data || [];

    const handleApprove = async (loanId: string) => {
        setLoadingId(loanId);
        try { await approveLoan.mutateAsync(loanId); toast.success('Solicitud aprobada'); }
        catch (e: any) { toast.error(e?.response?.data?.message ?? 'No se pudo aprobar'); }
        finally { setLoadingId(null); setConfirm({ type: null }); }
    };

    const handleReject = async (loanId: string) => {
        setLoadingId(loanId);
        try { await rejectLoan.mutateAsync(loanId); toast.success('Solicitud rechazada'); }
        catch (e: any) { toast.error(e?.response?.data?.message ?? 'No se pudo rechazar'); }
        finally { setLoadingId(null); setConfirm({ type: null }); }
    };

    const handleReturn = async (loanId: string) => {
        setLoadingId(loanId);
        try {
            await returnLoan.mutateAsync({ id: loanId, condition: returnCondition || undefined });
            toast.success('Devolución confirmada');
            setReturnCondition('');
        } catch (e: any) { toast.error(e?.response?.data?.message ?? 'No se pudo confirmar la devolución'); }
        finally { setLoadingId(null); setConfirm({ type: null }); }
    };

    const handleDelete = async (bookId: string) => {
        setLoadingId(bookId);
        try { await deleteBook.mutateAsync(bookId); toast.success('Libro retirado de la biblioteca'); }
        catch (e: any) { toast.error(e?.response?.data?.message ?? 'No se pudo retirar el libro'); }
        finally { setLoadingId(null); setConfirm({ type: null }); }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    if (error) return (
        <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>No se pudieron cargar tus libros. Intentá recargar la página.</AlertDescription>
        </Alert>
    );

    if (allBooks.length === 0) return (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <BookMarked className="w-14 h-14 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">No tenés libros registrados</h3>
            <p className="text-slate-500 mt-1">Podés agregar libros personales desde el Catálogo → "Nuevo Libro".</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Mis Libros</h2>
                <p className="text-sm text-slate-500 mt-1">Libros personales que pusiste a disposición de la comunidad.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {allBooks.map((book) => {
                    if (!book) return null;
                    const activeLoans = loansByBook[book.id] ?? [];

                    return (
                        <div key={book.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            {/* Book header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-base truncate">{book.title}</h3>
                                    <p className="text-sm text-slate-500">{book.author}</p>
                                </div>
                                <Badge variant="outline" className="ml-3 shrink-0 text-xs">
                                    {book.status === 'AVAILABLE' ? '🟢 Disponible' :
                                        book.status === 'RESERVED' ? '🟡 Reservado' :
                                            book.status === 'LOANED' ? '🔴 Prestado' : book.status}
                                </Badge>
                            </div>

                            {/* Active loans */}
                            {activeLoans.length > 0 ? (
                                <div className="space-y-3 mb-3">
                                    {activeLoans.map((loan) => (
                                        <div key={loan.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {(loan.borrower as any)?.person?.fullName ?? 'Solicitante'}
                                                </span>
                                                <span className="ml-auto text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                                    {getLoanStatusUI(loan.status as any).description}
                                                </span>
                                            </div>

                                            {loan.status === 'REQUESTED' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={() => setConfirm({ type: 'approve', loanId: loan.id })}
                                                        disabled={!!loadingId}>
                                                        {loadingId === loan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                                                        Aprobar
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                        onClick={() => setConfirm({ type: 'reject', loanId: loan.id })}
                                                        disabled={!!loadingId}>
                                                        <XCircle className="w-4 h-4 mr-1.5" /> Rechazar
                                                    </Button>
                                                </div>
                                            )}

                                            {loan.status === 'DELIVERED' && (
                                                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    onClick={() => setConfirm({ type: 'return', loanId: loan.id })}
                                                    disabled={!!loadingId}>
                                                    {loadingId === loan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-1.5" />}
                                                    Confirmar devolución
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic mb-3">Sin solicitudes activas</p>
                            )}

                            {/* Retire book */}
                            {book.status === 'AVAILABLE' && (
                                <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => setConfirm({ type: 'delete', bookId: book.id })}>
                                    <Trash2 className="w-4 h-4 mr-1.5" /> Retirar libro
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Confirm Modals */}
            <AlertDialog open={confirm.type === 'approve'} onOpenChange={(o) => !o && setConfirm({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Aprobar solicitud?</AlertDialogTitle>
                        <AlertDialogDescription>El libro quedará reservado para este solicitante.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-emerald-600" onClick={() => handleApprove(confirm.loanId!)}>Aprobar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirm.type === 'reject'} onOpenChange={(o) => !o && setConfirm({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Rechazar solicitud?</AlertDialogTitle>
                        <AlertDialogDescription>La solicitud será rechazada y el libro seguirá disponible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600" onClick={() => handleReject(confirm.loanId!)}>Rechazar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirm.type === 'return'} onOpenChange={(o) => !o && setConfirm({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Confirmar devolución</AlertDialogTitle>
                        <AlertDialogDescription>El libro volverá a estar disponible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-6 pb-2">
                        <Label className="text-sm text-slate-600 mb-1.5 block">Observación del estado (opcional)</Label>
                        <Textarea placeholder="Ej: Buen estado, leve desgaste en tapa..." value={returnCondition}
                            onChange={(e) => setReturnCondition(e.target.value)} rows={3} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setReturnCondition('')}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-indigo-600" onClick={() => handleReturn(confirm.loanId!)}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirm.type === 'delete'} onOpenChange={(o) => !o && setConfirm({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Retirar libro?</AlertDialogTitle>
                        <AlertDialogDescription>El libro no estará disponible para nuevos préstamos.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600" onClick={() => handleDelete(confirm.bookId!)}>Retirar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
