'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { QuickAccountDialog } from './quick-account-dialog';
import { NewTransactionDialog } from './new-transaction-dialog';
import { EditTransactionDialog } from './edit-transaction-dialog';

import { useRouter } from 'next/navigation';

export default function TreasuryPage() {
    const { churchId } = useAuth();
    const router = useRouter(); // Use Next.js router
    const [transactions, setTransactions] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!churchId) return;
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [txRes, accRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/transactions`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/accounts`, { headers })
            ]);

            if (txRes.ok) setTransactions(await txRes.json());
            if (accRes.ok) setAccounts(await accRes.json());

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [churchId]);

    const downloadReport = async () => {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/reports/ppt`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-financiero.pptx';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    // Calculate Stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Saldo Total Acumulado (Historical)
    const totalAccumulated = accounts?.filter((a: any) => a.type === 'asset').reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

    // Monthly transactions
    const monthlyTransactions = transactions.filter((t: any) => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const incomeMonth = monthlyTransactions.filter((t: any) =>
        t.destinationAccount?.type === 'asset' && t.sourceAccount?.type === 'income'
    ).reduce((acc, t) => acc + Number(t.amount), 0);

    const expenseMonth = monthlyTransactions.filter((t: any) =>
        t.sourceAccount?.type === 'asset' && t.destinationAccount?.type === 'expense'
    ).reduce((acc, t) => acc + Number(t.amount), 0);

    const monthlyBalance = incomeMonth - expenseMonth;

    // Logic to calculate individual account monthly balance
    const getAccountMonthlyBalance = (accountId: string) => {
        const in_ = monthlyTransactions.filter(t => t.destinationAccount?.id === accountId).reduce((acc, t) => acc + (Number(t.amount) * (Number(t.exchangeRate) || 1)), 0);
        const out_ = monthlyTransactions.filter(t => t.sourceAccount?.id === accountId).reduce((acc, t) => acc + Number(t.amount), 0);
        return in_ - out_;
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Tesorería <span className="text-primary font-medium"> Ecclesia</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-slate-500 font-medium tracking-tight">Control financiero y contabilidad de la iglesia.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/treasury/accounts')} className="text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all px-3">
                            Configuración
                        </Button>
                        <div className="h-4 w-px bg-slate-300/50 mx-1" />
                        <Button variant="ghost" size="sm" onClick={() => router.push('/treasury/budgets')} className="text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all px-3">
                            Presupuestos
                        </Button>
                        <div className="h-4 w-px bg-slate-300/50 mx-1" />
                        <Button variant="ghost" size="sm" onClick={() => router.push('/treasury/reports')} className="text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all px-3">
                            Reportes
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={downloadReport} className="shadow-sm hover:shadow-md transition-all border-slate-200">
                            <FileText className="w-4 h-4 md:mr-2 text-primary" />
                            <span className="hidden md:inline">PPT</span>
                        </Button>
                        <NewTransactionDialog onSuccess={fetchData} accounts={accounts} />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-50 shadow-none mb-1">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Balance Mensual</CardTitle>
                        <div className="p-2.5 bg-primary/5 rounded-xl">
                            <Wallet className="h-5 w-5 text-primary/70" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className={`text-3xl font-bold tracking-tight ${monthlyBalance < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                            {monthlyBalance >= 0 ? '+' : ''}${monthlyBalance.toLocaleString()}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Acumulado Histórico</p>
                            <span className="text-[11px] font-bold text-slate-600">${totalAccumulated.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl shadow-emerald-200/20 bg-gradient-to-br from-white to-emerald-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-emerald-50 shadow-none mb-1">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-600/70">Ingresos ({now.toLocaleString('es', { month: 'long' })})</CardTitle>
                        <div className="p-2.5 bg-emerald-50 rounded-xl">
                            <ArrowUpRight className="h-5 w-5 text-emerald-600/70" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-bold text-emerald-600 tracking-tight">+${incomeMonth.toLocaleString()}</div>
                        <p className="text-[10px] font-semibold text-emerald-400 mt-2 uppercase tracking-wide">Entradas del periodo</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl shadow-rose-200/20 bg-gradient-to-br from-white to-rose-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-rose-50 shadow-none mb-1">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-rose-600/70">Egresos ({now.toLocaleString('es', { month: 'long' })})</CardTitle>
                        <div className="p-2.5 bg-rose-50 rounded-xl">
                            <ArrowDownRight className="h-5 w-5 text-rose-600/70" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-bold text-rose-600 tracking-tight">-${expenseMonth.toLocaleString()}</div>
                        <p className="text-[10px] font-semibold text-rose-400 mt-2 uppercase tracking-wide">Gastos del periodo</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Accounts Sidebar */}
                <div className="lg:col-span-1 space-y-5">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Cuentas y Saldos</h2>
                    <div className="grid gap-4">
                        {accounts?.filter(a => a.type === 'asset').map((acc: any) => {
                            const mb = getAccountMonthlyBalance(acc.id);
                            return (
                                <Card key={acc.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                                    <div className={`h-1 w-full ${mb < 0 ? 'bg-rose-400' : 'bg-emerald-400 opacity-50'}`} />
                                    <CardContent className="p-4 flex flex-col gap-1.5">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{acc.currency || 'ARS'}</span>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[10px] font-bold ${mb < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                    {mb >= 0 ? '+' : ''}{mb.toLocaleString()} <span className="text-[9px] opacity-70 uppercase">Mes</span>
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-slate-700 text-sm tracking-tight">{acc.name}</span>
                                        <span className={`text-xl font-bold tracking-tight ${Number(acc.balance) < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                                            ${Number(acc.balance).toLocaleString()}
                                        </span>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Saldo Acumulado</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {accounts?.filter(a => a.type === 'asset').length === 0 && (
                            <div className="text-center py-10 px-4 text-xs text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-2xl">
                                No se encontraron cuentas activas.
                            </div>
                        )}
                    </div>
                </div>

                {/* Transactions List */}
                <Card className="lg:col-span-3 border border-slate-100 shadow-2xl shadow-slate-200/30 rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-10 py-5 px-6">
                        <CardTitle className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
                            <FileText className="w-5 h-5 text-primary opacity-60" />
                            Movimientos Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {transactions.length === 0 ? (
                                <div className="text-center py-24">
                                    <div className="inline-flex p-5 bg-slate-50 rounded-full mb-4 text-slate-200">
                                        <Wallet className="w-10 h-10" />
                                    </div>
                                    <p className="text-slate-400 font-medium text-sm tracking-tight">No se han registrado movimientos aún.</p>
                                </div>
                            ) : (
                                transactions.map((tx) => {
                                    const isIncome = tx.destinationAccount?.type === 'asset' && tx.sourceAccount?.type === 'income';
                                    const isExpense = tx.sourceAccount?.type === 'asset' && tx.destinationAccount?.type === 'expense';
                                    // const isTransfer = tx.sourceAccount?.type === 'asset' && tx.destinationAccount?.type === 'asset';

                                    return (
                                        <div key={tx.id} className="group flex items-center p-5 hover:bg-slate-50/50 transition-all cursor-default">
                                            <div className={`mr-5 p-3 rounded-2xl transition-all duration-300 ${isIncome ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' :
                                                isExpense ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' :
                                                    'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                                                }`}>
                                                {isIncome ? <ArrowUpRight className="w-5 h-5" /> :
                                                    isExpense ? <ArrowDownRight className="w-5 h-5" /> :
                                                        <Wallet className="w-5 h-5" />}
                                            </div>

                                            <div className="flex-grow space-y-1">
                                                <p className="text-[15px] font-semibold text-slate-800 tracking-tight leading-none">{tx.description}</p>
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 tracking-wide">
                                                    <span className="text-slate-500/80 uppercase">{new Date(tx.date).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="text-slate-500 font-semibold">{tx.sourceAccount?.name}</span>
                                                    <ArrowUpRight className="w-3 h-3 text-slate-300 rotate-90" />
                                                    <span className="text-slate-500 font-semibold">{tx.destinationAccount?.name}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className={`text-right ${isIncome ? 'text-emerald-600' :
                                                    isExpense ? 'text-rose-600' :
                                                        'text-blue-600'
                                                    }`}>
                                                    <div className="text-lg font-bold tracking-tight">
                                                        {isIncome ? '+' : isExpense ? '-' : ''}${Number(tx.amount).toLocaleString()}
                                                    </div>
                                                    {Number(tx.exchangeRate) !== 1 && (
                                                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-none mt-1">tc {tx.exchangeRate}</div>
                                                    )}
                                                </div>
                                                <EditTransactionDialog transaction={tx} onSuccess={fetchData} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
