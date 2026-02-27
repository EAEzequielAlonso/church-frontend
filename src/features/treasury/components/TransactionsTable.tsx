
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
import { ArrowDownRight, ArrowUpRight, Edit2, Eye, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { TransactionHistoryDialog } from "./TransactionHistoryDialog";

interface TransactionsTableProps {
    transactions: TreasuryTransactionModel[];
    onEdit?: (tx: TreasuryTransactionModel) => void;
    onDelete?: (id: string) => void;
    canEdit: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function TransactionsTable({ transactions, onEdit, onDelete, canEdit, page, totalPages, onPageChange }: TransactionsTableProps) {
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
                            <TableRow key={tx.id} className="hover:bg-slate-50/50">
                                <TableCell>
                                    <div className={`p-2 rounded-lg w-fit ${tx.isIncome ? 'bg-emerald-50' : tx.isExpense ? 'bg-rose-50' : 'bg-blue-50'}`}>
                                        {getIcon(tx)}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-slate-700">
                                    {format(new Date(tx.date), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell className="max-w-[250px] truncate text-slate-600" title={tx.description}>
                                    {tx.description}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {tx.isIncome ? (tx.categoryName || '-') : (tx.sourceAccountName || '-')}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {tx.isExpense ? (tx.categoryName || '-') : (tx.destinationAccountName || '-')}
                                </TableCell>
                                <TableCell className={`text-right font-bold ${getAmountColor(tx)}`}>
                                    {tx.isIncome ? '+' : tx.isExpense ? '-' : ''}
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => setHistoryTxId(tx.id)} title="Ver Historial">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        {canEdit && (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => onEdit?.(tx)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => onDelete?.(tx.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
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
