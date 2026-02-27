import api from '@/lib/api';
import { Book, BookCategory, BookFilters, Loan, LoanFilters, LoanStatus, PaginatedResult } from '../types/library.types';

export const libraryApi = {
    // Categories
    getCategories: async () => {
        const { data } = await api.get<BookCategory[]>('/library/categories');
        return data;
    },

    // Books
    getBooks: async (params: BookFilters) => {
        const { data } = await api.get<PaginatedResult<Book>>('/library/books', { params });
        return data;
    },

    createBook: async (book: Partial<Book>) => {
        const { data } = await api.post<Book>('/library/books', book);
        return data;
    },

    updateBook: async (id: string, book: Partial<Book>) => {
        const { data } = await api.put<Book>(`/library/books/${id}`, book);
        return data;
    },

    deleteBook: async (id: string) => {
        await api.delete(`/library/books/${id}`);
    },

    // Loans
    getLoans: async (params: LoanFilters) => {
        const { data } = await api.get<Loan[]>('/library/loans', { params });
        return data;
    },

    getMyLoans: async () => {
        const { data } = await api.get<Loan[]>('/library/my-loans');
        return data;
    },

    requestLoan: async (bookId: string, durationDays?: number) => {
        const { data } = await api.post<Loan>('/library/loans/request', { bookId, durationDays });
        return data;
    },

    approveLoan: async (id: string) => {
        const { data } = await api.post<Loan>(`/library/loans/${id}/approve`);
        return data;
    },

    deliverLoan: async (id: string, condition?: string) => {
        const { data } = await api.post<Loan>(`/library/loans/${id}/deliver`, { condition });
        return data;
    },

    returnLoan: async (id: string, condition?: string) => {
        const { data } = await api.post<Loan>(`/library/loans/${id}/return`, { condition });
        return data;
    },
};
