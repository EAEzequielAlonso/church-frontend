import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTransactionAudit } from "../hooks/useTransactionAudit";

interface TransactionAuditLogProps {
    transactionId: string;
}

export function TransactionAuditLog({ transactionId }: TransactionAuditLogProps) {
    const { logs, isLoading, error } = useTransactionAudit(transactionId);

    if (isLoading) return <div className="text-xs text-slate-400">Cargando historial...</div>;
    if (error) return null;
    if (!logs || logs.length === 0) return <div className="text-xs text-slate-400">Sin historial de cambios.</div>;

    return (
        <div className="h-[150px] w-full rounded border p-2 bg-slate-50 overflow-y-auto">
            <div className="space-y-4">
                {logs.map((log) => {
                    const before = log.before || {};
                    const after = log.after || {};

                    return (
                        <div key={log.id} className="text-xs">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-slate-700">
                                    {log.performedByEmail || 'Sistema'}
                                    <span className="font-normal text-slate-500 ml-1">({log.performedByRole || 'User'})</span>
                                </span>
                                <span className="text-slate-400">
                                    {format(new Date(log.createdAt), "Pp", { locale: es })}
                                </span>
                            </div>
                            <p className="text-slate-600 mb-1">{log.reason || 'Sin motivo especificado'}</p>
                            <div className="pl-2 border-l-2 border-slate-200 space-y-0.5">
                                {after.amount !== undefined && before.amount !== after.amount && (
                                    <div className="flex gap-2">
                                        <span className="text-rose-500 line-through">${before.amount || 0}</span>
                                        <span className="text-emerald-500">${after.amount}</span>
                                    </div>
                                )}
                                {after.description !== undefined && before.description !== after.description && (
                                    <div>
                                        <div className="text-rose-500 line-through truncate max-w-[200px]">{before.description || 'Sin descripción'}</div>
                                        <div className="text-emerald-500 truncate max-w-[200px]">{after.description}</div>
                                    </div>
                                )}
                                {log.action === 'CORRECT' && (
                                    <div className="text-amber-600 italic">Transacción corregida</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
