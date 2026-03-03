export type BookStatus = 'AVAILABLE' | 'RESERVED' | 'LOANED' | 'REMOVED';
export type LoanStatus = 'REQUESTED' | 'APPROVED' | 'DELIVERED' | 'RETURNED' | 'REJECTED' | 'CANCELLED';
export type BookOwnershipType = 'CHURCH' | 'MEMBER';

export interface BookCategory {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface OwnerMember {
    id: string;
    person: {
        id: string;
        fullName: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
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
    status: BookStatus;
    ownerMemberId?: string;
    ownerMember?: OwnerMember;
    code?: string;
    condition?: string;
    location?: string;
    churchId: string;
    createdAt: string;
    updatedAt: string;
}

export interface BorrowerInfo {
    id: string;
    person: {
        id: string;
        fullName: string;
        firstName: string;
        profileImage?: string;
    };
}

export interface Loan {
    id: string;
    bookId: string;
    book?: Book;
    borrowerId: string;
    borrower?: BorrowerInfo;
    requestedAt: string;
    approvedAt?: string;
    deliveredAt?: string;
    returnedAt?: string;
    dueDate: string;
    status: LoanStatus;
    conditionAtLoan?: string;
    conditionAtReturn?: string;
    approvedByUserId?: string;
    returnedConfirmedByUserId?: string;
}

export interface BookFilters {
    search?: string;
    categoryId?: string;
    status?: BookStatus;
    availability?: 'AVAILABLE' | 'UNAVAILABLE';
    ownerMemberId?: string;
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
