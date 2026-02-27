import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../api/library.api';
import { BookFilters, LoanFilters } from '../types/library.types';

export const useCategories = () => {
    return useQuery({
        queryKey: ['book-categories'],
        queryFn: libraryApi.getCategories,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useBooks = (filters: BookFilters) => {
    return useQuery({
        queryKey: ['books', filters],
        queryFn: () => libraryApi.getBooks(filters),
        placeholderData: (previousData) => previousData,
    });
};

export const useLoans = (filters: LoanFilters) => {
    return useQuery({
        queryKey: ['loans', filters],
        queryFn: () => libraryApi.getLoans(filters),
    });
};

export const useMyLoans = () => {
    return useQuery({
        queryKey: ['my-loans'],
        queryFn: libraryApi.getMyLoans,
    });
};

export const useLibraryMutations = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['books'] });
        queryClient.invalidateQueries({ queryKey: ['loans'] });
        queryClient.invalidateQueries({ queryKey: ['my-loans'] });
    };

    const createBook = useMutation({
        mutationFn: libraryApi.createBook,
        onSuccess: invalidate,
    });

    const updateBook = useMutation({
        mutationFn: (vars: { id: string; data: any }) => libraryApi.updateBook(vars.id, vars.data),
        onSuccess: invalidate,
    });

    const deleteBook = useMutation({
        mutationFn: libraryApi.deleteBook,
        onSuccess: invalidate,
    });

    const requestLoan = useMutation({
        mutationFn: (vars: { bookId: string; durationDays?: number }) => libraryApi.requestLoan(vars.bookId, vars.durationDays),
        onSuccess: invalidate,
    });

    const approveLoan = useMutation({
        mutationFn: libraryApi.approveLoan,
        onSuccess: invalidate,
    });

    const deliverLoan = useMutation({
        mutationFn: (vars: { id: string; condition?: string }) => libraryApi.deliverLoan(vars.id, vars.condition),
        onSuccess: invalidate,
    });

    const returnLoan = useMutation({
        mutationFn: (vars: { id: string; condition?: string }) => libraryApi.returnLoan(vars.id, vars.condition),
        onSuccess: invalidate,
    });

    return {
        createBook,
        updateBook,
        deleteBook,
        requestLoan,
        approveLoan,
        deliverLoan,
        returnLoan,
    };
};
