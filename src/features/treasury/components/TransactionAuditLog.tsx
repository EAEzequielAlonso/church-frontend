import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTransactionAudit } from "../hooks/useTransactionAudit";

interface TransactionAuditLogProps {
    transactionId: string;
}

export function TransactionAuditLog({ transactionId }: TransactionAuditLogProps) {
    const { logs, isLoading, error } = useTransactionAudit(transactionId);

    if (isLoading) return <div className="text-xs text-slate-400">Cargando historial...</div>;
    if (error) return null; // Silently fail or minimal error
    if (!logs || logs.length === 0) return <div className="text-xs text-slate-400">Sin historial de cambios.</div>;

    return (
        <div className="h-[150px] w-full rounded border p-2 bg-slate-50 overflow-y-auto">
            <div className="space-y-4">
                {logs.map((log) => (
                    <div key={log.id} className="text-xs">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-slate-700">
                                {(() => {
                                    const p = log.changedBy?.person;
                                    if (p?.firstName || p?.lastName) {
                                        return `${p.firstName || ''} ${p.lastName || ''}`.trim();
                                    }
                                    return log.changedBy?.email || 'Sistema / Desconocido';
                                })()}
                            </span>
                            <span className="text-slate-400">
                                {format(new Date(log.createdAt), "Pp", { locale: es })}
                            </span>
                        </div>
                        <p className="text-slate-600 mb-1">{log.changeReason}</p>
                        <div className="pl-2 border-l-2 border-slate-200 space-y-0.5">
                            {log.oldAmount !== log.newAmount && (
                                <div className="flex gap-2">
                                    <span className="text-rose-500 line-through">${log.oldAmount}</span>
                                    <span className="text-emerald-500">${log.newAmount}</span>
                                </div>
                            )}
                            {log.oldDescription !== log.newDescription && (
                                <div>
                                    <div className="text-rose-500 line-through truncate max-w-[200px]">{log.oldDescription}</div>
                                    <div className="text-emerald-500 truncate max-w-[200px]">{log.newDescription}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
