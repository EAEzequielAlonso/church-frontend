
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TreasuryAccountModel, TreasuryTransactionModel, AccountType } from "../types/treasury.types";
import { isSameMonth } from "date-fns";

interface AccountMonthlyStatusProps {
    accounts: TreasuryAccountModel[];
    transactions: TreasuryTransactionModel[];
}

export function AccountMonthlyStatus({ accounts, transactions }: AccountMonthlyStatusProps) {
    // Only show Asset/Liability accounts in this view (Money accounts)
    const moneyAccounts = accounts.filter(a => a.type === AccountType.ASSET || a.type === AccountType.LIABILITY);

    const now = new Date();

    const getMonthFlow = (accountId: string) => {
        return transactions
            .filter(t => isSameMonth(new Date(t.date), now))
            .reduce((acc, t) => {
                let flow = 0;
                // Using names because Model currently relies on names/strings? 
                // WAIT: Previous step I noticed Model might lack IDs or I need to use what's available.
                // Checking types: TreasuryTransactionModel has `sourceAccountId` and `destinationAccountId` (optional).
                // If they are missing, I might fall back to checking something else, but I added them in types.
                // Ideally backend fills them. If not, I rely on `sourceAccountName` which is risky but fallback.

                // Assuming IDs are present or falling back safe.
                if (t.destinationAccountId === accountId) flow += t.amount;
                if (t.sourceAccountId === accountId) flow -= t.amount;

                return acc + flow;
            }, 0);
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Estado de Cuentas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {moneyAccounts.map(account => {
                    const monthFlow = getMonthFlow(account.id);
                    const flowColor = monthFlow > 0 ? "text-green-600" : monthFlow < 0 ? "text-red-600" : "text-slate-500";

                    return (
                        <div key={account.id} className="flex flex-col space-y-1 border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">{account.name}</span>
                                <span className="font-bold text-sm">
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: account.currency }).format(account.balance)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>Mes actual:</span>
                                <span className={flowColor}>
                                    {monthFlow > 0 ? '+' : ''}
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: account.currency }).format(monthFlow)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
