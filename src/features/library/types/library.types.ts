export enum BookStatus {
    AVAILABLE = 'AVAILABLE',
    LOANED = 'LOANED',
    REMOVED = 'REMOVED',
}

export enum LoanStatus {
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED',
    DELIVERED = 'DELIVERED',
    RETURNED = 'RETURNED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    ACTIVE = 'ACTIVE', // Deprecated: Used for legacy data migration
}

export enum BookOwnershipType {
    CHURCH = 'CHURCH',
    MEMBER = 'MEMBER',
}

export interface BookCategory {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    categoryId: string;
    category?: BookCategory;
    description?: string;
    isbn?: string;
    coverUrl?: string;
    ownershipType: BookOwnershipType;
    isChurchOwned: boolean;
    status: BookStatus;
    ownerMemberId?: string;
    ownerMember?: any; // Simple member info
    code?: string;
    condition?: string;
    location?: string;
    churchId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Loan {
    id: string;
    bookId: string;
    book?: Book;
    borrowerId: string;
    borrower?: any;
    requestedAt: string;
    approvedAt?: string;
    deliveredAt?: string;
    returnedAt?: string;
    dueDate: string;
    status: LoanStatus;
    conditionAtLoan?: string;
    conditionAtReturn?: string;
}

export interface BookFilters {
    search?: string;
    categoryId?: string;
    status?: BookStatus;
    availability?: 'AVAILABLE' | 'UNAVAILABLE';
    ownerMemberId?: string;
    isChurchOwned?: boolean;
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        limit: number;
    };
}

export interface LoanFilters {
    status?: LoanStatus;
    borrowerId?: string;
}
