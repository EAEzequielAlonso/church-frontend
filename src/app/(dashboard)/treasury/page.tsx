'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/features/treasury/hooks/useTransactions';
import { useAccounts, useDeleteAccount } from '@/features/treasury/hooks/useAccounts';
import { useDeleteTransaction } from '@/features/treasury/hooks/useDeleteTransaction';
import { useCategories } from '@/features/treasury/hooks/useCategories'; // NEW

import { TransactionsList } from '@/features/treasury/components/TransactionsList'; // Keep for now if needed or remove
import { AccountsList } from '@/features/treasury/components/AccountsList';
import { CategoriesList } from '@/features/treasury/components/CategoriesList';
import { TransactionDialog } from '@/features/treasury/components/TransactionDialog';
import { AccountDialog } from '@/features/treasury/components/AccountDialog';
import { AccountBalanceCards } from '@/features/treasury/components/AccountBalanceCards'; // NEW
import { TransactionsFilter } from '@/features/treasury/components/TransactionsFilter'; // NEW
import { TransactionsTable } from '@/features/treasury/components/TransactionsTable'; // NEW
import { BudgetDashboard } from '@/features/budget/components/BudgetDashboard';
import { isSameMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TreasuryTransactionModel, TreasuryAccountModel, TransactionCategory } from '@/features/treasury/types/treasury.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TreasuryReports } from '@/features/treasury/components/TreasuryReports';

import { TransactionFilters } from '@/features/treasury/api/treasury.api';

export default function TreasuryPage() {

    // Filter State
    const [showTrash, setShowTrash] = useState(false);
    const [filters, setFilters] = useState<TransactionFilters>({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // End of month
    });

    const { transactions: displayedTransactions, isLoading: isLoadingTx } = useTransactions({
        ...filters,
        deleted: showTrash
    });

    const { accounts, isLoading: isLoadingAcc } = useAccounts();
    const { categories: incomeCats } = useCategories('income');
    const { categories: expenseCats } = useCategories('expense');
    const allCategories = [...incomeCats, ...expenseCats];

    const deleteTxHook = useDeleteTransaction();
    const deleteAccHook = useDeleteAccount();

    // State
    const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<TreasuryTransactionModel | null>(null);
    const [isAccDialogOpen, setIsAccDialogOpen] = useState(false);
    const [editingAcc, setEditingAcc] = useState<TreasuryAccountModel | null>(null);
    const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null); // NEW
    const [accountMode, setAccountMode] = useState<'account' | 'category'>('account');
    const canEdit = true;

    // Handlers - Transactions
    const handleEditTx = (tx: TreasuryTransactionModel) => {
        setEditingTx(tx);
        setIsTxDialogOpen(true);
    };

    const handleDeleteTx = async (id: string) => {
        await deleteTxHook.execute(id);
    };

    const handleCreateTx = () => {
        setEditingTx(null);
        setIsTxDialogOpen(true);
    };

    // Handlers - Accounts
    const handleEditAcc = (acc: TreasuryAccountModel) => {
        setEditingAcc(acc);
        setEditingCategory(null);
        setAccountMode('account');
        setIsAccDialogOpen(true);
    };

    const handleDeleteAcc = async (id: string) => {
        await deleteAccHook.execute(id);
    };

    // Handlers - Categories
    const handleEditCategory = (cat: TransactionCategory) => {
        setEditingCategory(cat);
        setEditingAcc(null);
        setAccountMode('category');
        setIsAccDialogOpen(true);
    };

    const handleDeleteCategory = async (id: string) => {
        // TODO: Implement delete category hook
        console.log("Delete category", id);
    };

    const handleCreateAcc = (mode: 'account' | 'category' = 'account') => {
        setEditingAcc(null);
        setEditingCategory(null);
        setAccountMode(mode);
        setIsAccDialogOpen(true);
    };

    // Filter display text
    const currentMonth = format(new Date(), 'MMMM yyyy', { locale: es });

    return (
        <Tabs defaultValue="overview" className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tesorería</h1>
                    <p className="text-slate-500">Gestión financiera centralizada.</p>
                </div>
                <TabsList>
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="accounts">Cuentas y Categorías</TabsTrigger>
                    <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
                    <TabsTrigger value="reports">Reportes</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
                {/* Header Section */}
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 capitalize">{showTrash ? 'Papelera de Reciclaje' : 'Resumen del mes'}</h2>
                        <p className="text-sm text-slate-500">{showTrash ? 'Transacciones eliminadas.' : 'Vista de movimientos filtrados.'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTrash(!showTrash)}
                            className={showTrash ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'text-slate-500 hover:text-slate-700'}
                        >
                            {showTrash ? 'Ver Activos' : 'Ver Eliminados'}
                        </Button>
                        {canEdit && !showTrash && (
                            <Button onClick={handleCreateTx} className="shadow-lg bg-slate-900 hover:bg-slate-800 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Transacción
                            </Button>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                {!showTrash && <AccountBalanceCards accounts={accounts} transactions={displayedTransactions} />}

                {/* Filters */}
                {!showTrash && (
                    <div className="mt-6 mb-4">
                        <TransactionsFilter
                            categories={allCategories}
                            accounts={accounts}
                            initialFilters={filters as any} // Cast to avoid strict type mismatch for now
                            onFilterChange={(criteria) => {
                                setFilters(prev => ({ ...prev, ...criteria }));
                            }}
                        />
                    </div>
                )}



                {/* Main Content */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{showTrash ? 'Transacciones Eliminadas' : 'Listado de Movimientos'}</h3>
                    <TransactionsTable
                        transactions={displayedTransactions}
                        onEdit={handleEditTx}
                        onDelete={handleDeleteTx}
                        canEdit={canEdit && !showTrash}
                        page={filters.page || 1}
                        totalPages={useTransactions({ ...filters, deleted: showTrash }).meta?.lastPage || 1}
                        onPageChange={(p) => setFilters((prev: any) => ({ ...prev, page: p }))}
                    />
                </div>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
                <div className="space-y-8">
                    {/* Money Accounts Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-600 p-1 rounded">🏦</span>
                                    Cuentas de Dinero
                                </h2>
                                <p className="text-sm text-slate-500">Cajas, Bancos, Activos.</p>
                            </div>
                            {canEdit && (
                                <Button onClick={() => handleCreateAcc('account')}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Cuenta
                                </Button>
                            )}
                        </div>
                        <AccountsList
                            accounts={accounts.filter(a => a.type === 'asset' || a.type === 'liability' || a.type === 'equity')}
                            canEdit={canEdit}
                            onEdit={handleEditAcc}
                            onDelete={handleDeleteAcc}
                            showBalance={false}
                        />
                    </div>

                    <div className="border-t border-slate-100 my-4" />

                    {/* Categories Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="bg-orange-100 text-orange-600 p-1 rounded">🏷️</span>
                                    Categorías
                                </h2>
                                <p className="text-sm text-slate-500">Conceptos de Ingresos y Gastos.</p>
                            </div>
                            {canEdit && (
                                <Button variant="outline" onClick={() => handleCreateAcc('category')}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Categoría
                                </Button>
                            )}
                        </div>
                        <CategoriesList
                            categories={allCategories}
                            canEdit={canEdit}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                        />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="budgets" className="space-y-4">
                <BudgetDashboard />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
                <TreasuryReports transactions={displayedTransactions} />
            </TabsContent>

            {/* Dialogs Global */}
            {
                canEdit && (
                    <>
                        <TransactionDialog
                            open={isTxDialogOpen}
                            onOpenChange={setIsTxDialogOpen}
                            accounts={accounts}
                            transactionToEdit={editingTx}
                            onSuccess={() => setIsTxDialogOpen(false)}
                        />
                        <AccountDialog
                            open={isAccDialogOpen}
                            onOpenChange={setIsAccDialogOpen}
                            accountToEdit={editingAcc}
                            categoryToEdit={editingCategory}
                            mode={accountMode}
                        />
                    </>
                )
            }
        </Tabs >
    );
}
