import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../api/library.api';
import { BookFilters, LoanFilters } from '../types/library.types';
import { useAuth } from '@/context/AuthContext';

export const useCategories = () => {
    return useQuery({
        queryKey: ['book-categories'],
        queryFn: libraryApi.getCategories,
        staleTime: 1000 * 60 * 60,
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

export const useMyBookLoans = () => {
    return useQuery({
        queryKey: ['my-book-loans'],
        queryFn: libraryApi.getMyBookLoans,
    });
};

export const useMyOwnedBooks = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['my-owned-books', user?.memberId],
        queryFn: () => libraryApi.getBooks({ ownerMemberId: user?.memberId, limit: 100 }),
        enabled: !!user?.memberId,
    });
};

export const useLibraryMutations = () => {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['books'] });
        queryClient.invalidateQueries({ queryKey: ['loans'] });
        queryClient.invalidateQueries({ queryKey: ['my-loans'] });
        queryClient.invalidateQueries({ queryKey: ['my-book-loans'] });
        queryClient.invalidateQueries({ queryKey: ['my-owned-books'] });
    };

    const createBook = useMutation({
        mutationFn: libraryApi.createBook,
        onSuccess: invalidateAll,
    });

    const updateBook = useMutation({
        mutationFn: (vars: { id: string; data: any }) => libraryApi.updateBook(vars.id, vars.data),
        onSuccess: invalidateAll,
    });

    const deleteBook = useMutation({
        mutationFn: libraryApi.deleteBook,
        onSuccess: invalidateAll,
    });

    const requestLoan = useMutation({
        mutationFn: (vars: { bookId: string; durationDays?: number }) =>
            libraryApi.requestLoan(vars.bookId, vars.durationDays),
        onSuccess: invalidateAll,
    });

    const approveLoan = useMutation({
        mutationFn: libraryApi.approveLoan,
        onSuccess: invalidateAll,
    });

    const rejectLoan = useMutation({
        mutationFn: libraryApi.rejectLoan,
        onSuccess: invalidateAll,
    });

    const cancelLoan = useMutation({
        mutationFn: libraryApi.cancelLoan,
        onSuccess: invalidateAll,
    });

    const deliverLoan = useMutation({
        mutationFn: (vars: { id: string; condition?: string }) =>
            libraryApi.deliverLoan(vars.id, vars.condition),
        onSuccess: invalidateAll,
    });

    const returnLoan = useMutation({
        mutationFn: (vars: { id: string; condition?: string }) =>
            libraryApi.returnLoan(vars.id, vars.condition),
        onSuccess: invalidateAll,
    });

    return {
        createBook,
        updateBook,
        deleteBook,
        requestLoan,
        approveLoan,
        rejectLoan,
        cancelLoan,
        deliverLoan,
        returnLoan,
    };
};
