import api from '@/lib/api';
import { Book, BookFilters, BookCategory, Loan, LoanFilters, PaginatedResult } from '../types/library.types';

export const libraryApi = {

    // ─── Categories ────────────────────────────────────────────────────────

    getCategories: async (): Promise<BookCategory[]> => {
        const { data } = await api.get<BookCategory[]>('/library/categories');
        return data;
    },

    // ─── Books ─────────────────────────────────────────────────────────────

    getBooks: async (params: BookFilters): Promise<PaginatedResult<Book>> => {
        const { data } = await api.get<PaginatedResult<Book>>('/library/books', { params });
        return data;
    },

    createBook: async (book: Partial<Book>): Promise<Book> => {
        const { data } = await api.post<Book>('/library/books', book);
        return data;
    },

    updateBook: async (id: string, book: Partial<Book>): Promise<Book> => {
        const { data } = await api.put<Book>(`/library/books/${id}`, book);
        return data;
    },

    deleteBook: async (id: string): Promise<void> => {
        await api.delete(`/library/books/${id}`);
    },

    // ─── Loans ─────────────────────────────────────────────────────────────

    getLoans: async (params: LoanFilters): Promise<Loan[]> => {
        const { data } = await api.get<Loan[]>('/library/loans', { params });
        return data;
    },

    // Loans for books owned by the current user (owner view)
    getMyBookLoans: async (): Promise<Loan[]> => {
        const { data } = await api.get<Loan[]>('/library/loans/my-book-loans');
        return data;
    },

    getMyLoans: async (): Promise<Loan[]> => {
        const { data } = await api.get<Loan[]>('/library/my-loans');
        return data;
    },

    requestLoan: async (bookId: string, durationDays?: number): Promise<Loan> => {
        const { data } = await api.post<Loan>('/library/loans/request', { bookId, durationDays });
        return data;
    },

    approveLoan: async (id: string): Promise<Loan> => {
        const { data } = await api.post<Loan>(`/library/loans/${id}/approve`);
        return data;
    },

    deliverLoan: async (id: string, condition?: string): Promise<Loan> => {
        const { data } = await api.post<Loan>(`/library/loans/${id}/deliver`, { condition });
        return data;
    },

    returnLoan: async (id: string, condition?: string): Promise<Loan> => {
        const { data } = await api.post<Loan>(`/library/loans/${id}/return`, { condition });
        return data;
    },

    rejectLoan: async (id: string): Promise<Loan> => {
        const { data } = await api.post<Loan>(`/library/loans/${id}/reject`);
        return data;
    },

    cancelLoan: async (id: string): Promise<Loan> => {
        const { data } = await api.post<Loan>(`/library/loans/${id}/cancel`);
        return data;
    },
};
