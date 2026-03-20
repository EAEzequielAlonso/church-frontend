export enum TransactionStatus {
    COMPLETED = 'completed',
    PENDING_APPROVAL = 'pending_approval',
    REJECTED = 'rejected'
}

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
    TRANSFER = 'transfer'
}

export enum AuditEntityType {
    TRANSACTION = 'TRANSACTION',
    ACCOUNT = 'ACCOUNT',
    PERIOD = 'PERIOD',
    BUDGET = 'BUDGET',
}

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    CORRECT = 'CORRECT',
    CLOSE_PERIOD = 'CLOSE_PERIOD',
    REOPEN_PERIOD = 'REOPEN_PERIOD',
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
    isArchived: boolean;
    hasTransactions: boolean;
}

export type TransactionCategoryModel = TransactionCategory;

// --- DTOs (Backend Shape) ---

export interface TreasuryAccountDto {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    description?: string;
    churchId?: string;
    isArchived: boolean;
    hasTransactions?: boolean;
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
    baseCurrency: string;
    amountBaseCurrency: number;
    status: TransactionStatus;
    type: TransactionType;
    sourceAccount?: TreasuryAccountDto;
    destinationAccount?: TreasuryAccountDto;
    category?: TransactionCategory;
    ministry?: MinistryDto;
    createdById?: string;
    deletedAt?: string;
    reversalId?: string;
    correctionId?: string;
    isCorrection?: boolean;
    isInvalidated?: boolean;
}

// --- Payload DTOs ---

export interface CreateTransactionDto {
    churchId: string;
    type: TransactionType;
    description: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    categoryId?: string;
    sourceAccountId?: string;
    destinationAccountId?: string;
    ministryId?: string | null;
    date?: Date;
}

export interface UpdateTransactionDto {
    id: string;
    churchId: string;
    userId: string;
    type?: TransactionType;
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
    isArchived?: boolean;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
    isArchived?: boolean;
}

export interface TreasuryStats {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    balanceTrend: number;
    incomeTrend: number;
    expenseTrend: number;
}

export interface CreateCategoryDto {
    name: string;
    type: string;
    churchId: string;
    parentCategoryId?: string;
    color?: string;
    icon?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
    isArchived?: boolean;
}

// --- UI Models (Mapped) ---

export interface TreasuryTransactionModel {
    id: string;
    date: Date;
    description: string;
    amount: number;
    currency: string;
    exchangeRate: number;
    baseCurrency: string;
    amountBaseCurrency: number;
    status: TransactionStatus;
    type: TransactionType;
    categoryId?: string;
    categoryName?: string;
    categoryColor?: string;
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
    reversalId?: string;
    correctionId?: string;
    isCorrection: boolean;
    isInvalidated: boolean;
}

export interface TreasuryAccountModel {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    formattedBalance: string;
    isArchived: boolean;
    hasTransactions: boolean;
}
