export enum TransactionStatus {
    COMPLETED = 'completed',
    PENDING_APPROVAL = 'pending_approval',
    REJECTED = 'rejected'
}

export enum AccountType {
    ASSET = 'asset',
    LIABILITY = 'liability',
    EQUITY = 'equity'
}

export const AccountTypeLabels: Record<AccountType, string> = {
    [AccountType.ASSET]: 'Activo',
    [AccountType.LIABILITY]: 'Pasivo',
    [AccountType.EQUITY]: 'Patrimonio',
};

export interface TransactionCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
    icon?: string;
    churchId?: string;
    parentId?: string;
}

export type TransactionCategoryModel = TransactionCategory;

// --- DTOs (Backend Shape) ---

export interface TreasuryAccountDto {
    id: string;
    name: string;
    type: AccountType;
    balance: number; // string/decimal from backend, handled as number in UI usually or kept string
    currency: string;
    description?: string;
    churchId?: string;
}

export interface MinistryDto {
    id: string;
    name: string;
}

export interface TreasuryTransactionDto {
    id: string;
    date: string; // ISO Date
    description: string;
    amount: number; // string/decimal
    currency: string;
    exchangeRate: number;
    status: TransactionStatus;
    sourceAccount?: TreasuryAccountDto;
    destinationAccount?: TreasuryAccountDto;
    category?: TransactionCategory;
    ministry?: MinistryDto;
    createdById?: string;
    deletedAt?: string;
}

// --- Payload DTOs ---

export interface CreateTransactionDto {
    churchId: string;
    description: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    categoryId?: string; // NEW: Replaces source/dest for income/expense
    sourceAccountId?: string;
    destinationAccountId?: string;
    ministryId?: string | null;
    date?: Date;
}

export interface UpdateTransactionDto {
    id: string;
    churchId: string;
    userId: string;
    description?: string;
    amount?: number;
    categoryId?: string; // NEW
    sourceAccountId?: string;
    destinationAccountId?: string;
    ministryId?: string | null;
    reason?: string;
}

export interface CreateAccountDto {
    name: string;
    type: AccountType;
    currency: string;
    description?: string;
    churchId: string;
    balance?: number;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> { }

export interface TreasuryStats {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    balanceTrend: number;
    incomeTrend: number;
    expenseTrend: number;
}

// --- UI Models (Mapped) ---

export interface TreasuryTransactionModel {
    id: string;
    date: Date;
    description: string;
    amount: number;
    currency: string;
    exchangeRate: number;
    status: TransactionStatus;
    categoryId?: string; // NEW
    categoryName?: string; // NEW
    categoryColor?: string; // NEW
    sourceAccountId?: string;
    destinationAccountId?: string;
    sourceAccountName: string;
    destinationAccountName: string;
    ministryName?: string;
    isIncome: boolean;
    isExpense: boolean;
    isTransfer: boolean;
    displayAmount: string;
    deletedAt?: Date;
}

export interface TreasuryAccountModel {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    formattedBalance: string;
}
