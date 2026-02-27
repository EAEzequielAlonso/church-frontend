import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { TreasuryTransactionModel } from '../types/treasury.types';
import { FileText, Wallet, ArrowUpRight, ArrowDownRight, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TransactionHistoryDialog } from './TransactionHistoryDialog';

interface TransactionsListProps {
    transactions: TreasuryTransactionModel[];
    onEdit?: (tx: TreasuryTransactionModel) => void;
    onDelete?: (id: string) => void;
    canEdit: boolean;
}

export function TransactionsList({ transactions, onEdit, onDelete, canEdit }: TransactionsListProps) {
    if (transactions.length === 0) {
        return (
            <Card className="border border-slate-100 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <Wallet className="w-12 h-12 mb-3 text-slate-200" />
                    <p>No hay movimientos registrados.</p>
                </CardContent>
            </Card>
        );
    }

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    const [historyTxId, setHistoryTxId] = useState<string | null>(null);

    const handleViewHistory = (id: string) => {
        setHistoryTxId(id);
    };

    return (
        <Card className="border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 flex flex-row justify-between items-center">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Movimientos Recientes
                </CardTitle>
                <div className="text-xs text-slate-400 font-normal">
                    Total: {transactions.length}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                    {paginatedTransactions.map((tx) => (
                        <div key={tx.id} className="group flex items-center p-4 hover:bg-slate-50 transition-colors">
                            {/* Icon */}
                            <div className={`mr-4 p-2.5 rounded-xl ${tx.isIncome ? 'bg-emerald-50 text-emerald-600' :
                                tx.isExpense ? 'bg-rose-50 text-rose-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                {tx.isIncome ? <ArrowUpRight className="w-4 h-4" /> :
                                    tx.isExpense ? <ArrowDownRight className="w-4 h-4" /> :
                                        <Wallet className="w-4 h-4" />}
                            </div>

                            {/* Details */}
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold text-slate-700 text-sm truncate">{tx.description}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                    <span>{tx.date.toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="font-medium text-slate-500">
                                        {tx.isIncome ? (tx.categoryName || tx.sourceAccountName) : tx.sourceAccountName}
                                    </span>
                                    <span>→</span>
                                    <span className="font-medium text-slate-500">
                                        {tx.isExpense ? (tx.categoryName || tx.destinationAccountName) : tx.destinationAccountName}
                                    </span>

                                </div>
                            </div>

                            {/* Amount & Actions */}
                            <div className="flex items-center gap-4 pl-4">
                                <div className="flex flex-col items-end">
                                    <div className={`text-right font-bold text-sm ${tx.isIncome ? 'text-emerald-600' :
                                        tx.isExpense ? 'text-rose-600' : 'text-blue-600'
                                        }`}>
                                        {tx.isIncome ? '+' : tx.isExpense ? '-' : ''}
                                        {tx.currency === 'USD' ? 'u$s' : '$'}{tx.displayAmount.replace(/[^\d.,]/g, '')}
                                    </div>

                                    {/* Conversion Detail */}
                                    {tx.isTransfer && tx.exchangeRate && tx.exchangeRate !== 1 && (
                                        <div className="text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded mt-1">
                                            TC: {tx.exchangeRate} | Total: {
                                                tx.currency === 'USD'
                                                    ? `$ ${(tx.amount * tx.exchangeRate).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                                    : `u$s ${(tx.amount / tx.exchangeRate).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                            }
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => handleViewHistory(tx.id)} title="Ver Historial">
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>

                                    {canEdit && (
                                        <>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => onEdit?.(tx)}>
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción revertirá los saldos de las cuentas afectadas. No se puede deshacer.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => onDelete?.(tx.id)}>
                                                            Confirmar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
                        <div className="text-xs text-slate-500">
                            Página {currentPage} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className="h-8 text-xs"
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className="h-8 text-xs"
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            <TransactionHistoryDialog
                open={!!historyTxId}
                onOpenChange={(open) => !open && setHistoryTxId(null)}
                transactionId={historyTxId}
            />
        </Card>
    );
}
