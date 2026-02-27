import { Card, CardContent } from '@/components/ui/card';
import { TreasuryAccountModel, AccountType, AccountTypeLabels } from '../types/treasury.types';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AccountsListProps {
    accounts: TreasuryAccountModel[];
    onEdit?: (account: TreasuryAccountModel) => void;
    onDelete?: (id: string) => void;
    canEdit: boolean;
    showBalance?: boolean;
}

export function AccountsList({ accounts, onEdit, onDelete, canEdit, showBalance = false }: AccountsListProps) {
    if (accounts.length === 0) return <div className="text-slate-400 text-sm">No hay registros.</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acc => (
                <Card key={acc.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                                {acc.currency}
                            </Badge>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${acc.type === AccountType.EQUITY ? 'bg-indigo-50 text-indigo-600' :
                                acc.type === AccountType.LIABILITY ? 'bg-orange-50 text-orange-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                {AccountTypeLabels[acc.type]}
                            </span>
                        </div>
                        <h3 className="font-semibold text-slate-700 truncate" title={acc.name}>{acc.name}</h3>

                        {showBalance && (
                            <p className={`text-xl font-bold mt-1 ${acc.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                {acc.formattedBalance}
                            </p>
                        )}

                        {canEdit && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-md shadow-sm backdrop-blur-sm">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit?.(acc)}>
                                    <Edit2 className="h-3 w-3 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete?.(acc.id)}>
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
