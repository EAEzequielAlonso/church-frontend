
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TreasuryTransactionModel } from "../types/treasury.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, Edit2, Eye, Trash2, Wallet, Undo2 } from "lucide-react";
import { useState } from "react";
import { TransactionHistoryDialog } from "./TransactionHistoryDialog";
import { usePeriods, useIsPeriodClosed } from "../hooks/usePeriods";
import { useAuth } from "@/context/AuthContext";

interface TransactionsTableProps {
    transactions: TreasuryTransactionModel[];
    onEdit?: (tx: TreasuryTransactionModel) => void;
    onDelete?: (id: string) => void;
    onCorrect?: (tx: TreasuryTransactionModel) => void;
    canEdit: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// Subcomponente para evaluar bloqueo individual de cada fila según su mes
function TransactionRowActions({ tx, canEdit, onEdit, onCorrect, onHistory }: any) {
    const { churchId } = useAuth();
    const date = new Date(tx.date);
    const { isClosed } = useIsPeriodClosed(churchId || '', date.getFullYear(), date.getMonth() + 1);

    return (
        <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => onHistory(tx.id)} title="Ver Historial">
                <Eye className="w-4 h-4" />
            </Button>
            {canEdit && !tx.isInvalidated && tx.status === 'completed' && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-amber-600"
                        onClick={() => onCorrect?.(tx)}
                        title={isClosed ? "Período cerrado" : "Corregir"}
                        disabled={isClosed}
                    >
                        <Undo2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-primary"
                        onClick={() => onEdit?.(tx)}
                        title={isClosed ? "Período cerrado" : "Editar"}
                        disabled={isClosed}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                </>
            )}
        </div>
    );
}

export function TransactionsTable({ transactions, onEdit, onDelete, onCorrect, canEdit, page, totalPages, onPageChange }: TransactionsTableProps) {
    const [historyTxId, setHistoryTxId] = useState<string | null>(null);

    const getIcon = (tx: TreasuryTransactionModel) => {
        if (tx.isIncome) return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
        if (tx.isExpense) return <ArrowDownRight className="w-4 h-4 text-rose-600" />;
        return <Wallet className="w-4 h-4 text-blue-600" />;
    };

    const getAmountColor = (tx: TreasuryTransactionModel) => {
        if (tx.isIncome) return "text-emerald-600";
        if (tx.isExpense) return "text-rose-600";
        return "text-blue-600";
    };

    return (
        <div className="rounded-md border border-slate-100 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Categoría / Origen</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="w-[100px] text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                No se encontraron transacciones.
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((tx) => (
                            <TableRow key={tx.id} className={`hover:bg-slate-50/50 ${tx.isInvalidated ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                <TableCell>
                                    <div className={`p-2 rounded-lg w-fit ${tx.isIncome ? 'bg-emerald-50' : tx.isExpense ? 'bg-rose-50' : 'bg-blue-50'}`}>
                                        {getIcon(tx)}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-slate-700">
                                    <div className={tx.isInvalidated ? 'line-through' : ''}>
                                        {format(new Date(tx.date), "dd/MM/yyyy")}
                                    </div>
                                    {tx.isCorrection && (
                                        <div className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded w-fit mt-1">Corregida</div>
                                    )}
                                    {tx.isInvalidated && (
                                        <div className="text-[10px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded w-fit mt-1">Anulada</div>
                                    )}
                                </TableCell>
                                <TableCell className={`max-w-[250px] ${tx.isInvalidated ? 'line-through text-slate-400' : ''}`}>
                                    <div className="truncate text-slate-600 font-medium" title={tx.description}>
                                        {tx.description}
                                    </div>
                                    {tx.ministryName && (
                                        <div className="text-xs text-slate-400 mt-0.5" title={tx.ministryName}>
                                            Min: {tx.ministryName}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className={tx.isInvalidated ? 'line-through text-slate-400' : ''}>
                                    {tx.categoryName ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${tx.categoryColor || '#e2e8f0'}30`, color: tx.categoryColor || '#475569' }}>
                                            {tx.categoryName}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500">{tx.sourceAccountName || '-'}</span>
                                    )}
                                </TableCell>
                                <TableCell className={`text-slate-500 ${tx.isInvalidated ? 'line-through text-slate-400' : ''}`}>
                                    {!tx.isExpense && !tx.isIncome ? tx.destinationAccountName : (tx.isExpense ? tx.sourceAccountName : tx.destinationAccountName)}
                                </TableCell>
                                <TableCell className={`text-right ${getAmountColor(tx)} ${tx.isInvalidated ? 'line-through' : ''}`}>
                                    <div className="font-bold">
                                        {tx.isIncome ? '+' : tx.isExpense ? '-' : ''}
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                                    </div>
                                    {tx.currency !== tx.baseCurrency && (
                                        <div className="text-xs opacity-70 mt-0.5 font-medium">
                                            ≈ {new Intl.NumberFormat('es-AR', { style: 'currency', currency: tx.baseCurrency }).format(tx.amountBaseCurrency)}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {!tx.isInvalidated && (
                                        <TransactionRowActions
                                            tx={tx}
                                            canEdit={canEdit}
                                            onEdit={onEdit}
                                            onCorrect={onCorrect}
                                            onHistory={setHistoryTxId}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <div className="flex items-center justify-end space-x-2 p-4 bg-slate-50 border-t border-slate-100">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                >
                    Anterior
                </Button>
                <span className="text-sm text-slate-600 font-medium">
                    Página {page} de {totalPages || 1}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                >
                    Siguiente
                </Button>
            </div>

            <TransactionHistoryDialog
                open={!!historyTxId}
                onOpenChange={(open) => !open && setHistoryTxId(null)}
                transactionId={historyTxId}
            />
        </div>
    );
}
