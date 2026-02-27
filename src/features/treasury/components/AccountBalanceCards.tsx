import { Card, CardContent } from "@/components/ui/card";
import { TreasuryAccountModel, AccountType, TreasuryTransactionModel } from "../types/treasury.types";
import { Wallet, CreditCard, Building, PiggyBank, ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface AccountBalanceCardsProps {
    accounts: TreasuryAccountModel[];
    transactions: TreasuryTransactionModel[];
}

export function AccountBalanceCards({ accounts, transactions }: AccountBalanceCardsProps) {
    // Filter out only Asset/Liabilities for balance view
    const visibleAccounts = accounts.filter(a =>
        a.type === AccountType.ASSET ||
        a.type === AccountType.LIABILITY ||
        a.type === AccountType.EQUITY
    );

    // Calculate Global Monthly Stats from transactions
    const monthlyIncome = transactions
        .filter(t => t.isIncome)
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
        .filter(t => t.isExpense)
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBalance = monthlyIncome - monthlyExpense;

    const getIcon = (type: AccountType) => {
        switch (type) {
            case AccountType.ASSET: return <Wallet className="w-4 h-4 text-emerald-500" />;
            case AccountType.LIABILITY: return <CreditCard className="w-4 h-4 text-rose-500" />;
            case AccountType.EQUITY: return <Building className="w-4 h-4 text-blue-500" />;
            default: return <PiggyBank className="w-4 h-4 text-slate-500" />;
        }
    };

    const calculateAccountMonthlyFlow = (accountId: string) => {
        return transactions.reduce((acc, t) => {
            if (t.sourceAccountId === accountId) {
                return acc - t.amount;
            }
            if (t.destinationAccountId === accountId) {
                return acc + t.amount;
            }
            return acc;
        }, 0);
    };

    return (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-4">
                {/* Global Summary Card */}
                <Card className="w-[300px] shrink-0 border-slate-200 shadow-sm bg-slate-50/50">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                                <DollarSign className="w-4 h-4 text-slate-500" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-700">Balance del Mes</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-200">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase mb-0.5">Ingresos</p>
                                <p className="text-xs font-bold text-emerald-600 truncate">
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monthlyIncome)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase mb-0.5">Egresos</p>
                                <p className="text-xs font-bold text-rose-600 truncate">
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monthlyExpense)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase mb-0.5">Neto</p>
                                <p className={`text-xs font-bold truncate ${monthlyBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monthlyBalance)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Cards */}
                {visibleAccounts.map((account) => {
                    const monthlyFlow = calculateAccountMonthlyFlow(account.id);
                    return (
                        <Card key={account.id} className="w-[240px] shrink-0 shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-1.5 bg-slate-50 rounded-md border border-slate-100">
                                        {getIcon(account.type)}
                                    </div>
                                    <h3 className="font-semibold text-sm text-slate-700 truncate flex-1" title={account.name}>
                                        {account.name}
                                    </h3>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Saldo</span>
                                        <span className={`text-lg font-bold ${account.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: account.currency }).format(account.balance)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                                        <span className="text-[10px] text-slate-400">Movimiento Mes</span>
                                        <span className={`text-xs font-medium ${monthlyFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {monthlyFlow > 0 ? '+' : ''}{new Intl.NumberFormat('es-AR', { style: 'currency', currency: account.currency, maximumFractionDigits: 0 }).format(monthlyFlow)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
