import { TreasuryTransactionDto, TreasuryTransactionModel, TreasuryAccountDto, TreasuryAccountModel, AccountType } from '../types/treasury.types';

export const toUiTransaction = (dto: TreasuryTransactionDto): TreasuryTransactionModel => {
    // Logic based on presence of accounts (New standard)
    // Transfer: Both source and dest exist
    // Income: Only dest exists (source is null or category)
    // Expense: Only source exists (dest is null or category)

    // Fallback for legacy data where Source might be an 'Income Account':
    // If we assume strict adherence to new backend seed:
    const isTransfer = !!(dto.sourceAccount && dto.destinationAccount);
    const isIncome = !isTransfer && !!dto.destinationAccount;
    const isExpense = !isTransfer && !!dto.sourceAccount;

    return {
        id: dto.id,
        date: new Date(dto.date),
        description: dto.description,
        amount: Number(dto.amount),
        currency: dto.currency,
        exchangeRate: Number(dto.exchangeRate),
        status: dto.status,
        sourceAccountId: dto.sourceAccount?.id,
        destinationAccountId: dto.destinationAccount?.id,
        categoryId: dto.category?.id, // NEW
        categoryName: dto.category?.name, // NEW
        categoryColor: dto.category?.color, // NEW

        sourceAccountName: dto.sourceAccount?.name || (isIncome ? 'Ingreso' : 'Desconocido'),
        destinationAccountName: dto.destinationAccount?.name || (isExpense ? 'Gasto' : 'Desconocido'),
        ministryName: dto.ministry?.name,
        isIncome,
        isExpense,
        isTransfer,
        displayAmount: `$${Number(dto.amount).toLocaleString()}`,
        deletedAt: dto.deletedAt ? new Date(dto.deletedAt) : undefined
    };
};

export const toUiAccount = (dto: TreasuryAccountDto): TreasuryAccountModel => {
    return {
        id: dto.id,
        name: dto.name,
        type: dto.type,
        balance: Number(dto.balance),
        currency: dto.currency,
        formattedBalance: `$${Number(dto.balance).toLocaleString()}`
    };
};
