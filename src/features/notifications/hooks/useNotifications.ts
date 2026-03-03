import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import { toast } from 'sonner';

export const NOTIFICATIONS_KEY = ['notifications'] as const;
export const UNREAD_COUNT_KEY = ['notifications-unread-count'] as const;

/**
 * Hook to get all notifications (last 20 by default).
 * Refreshed automatically on window focus and after mutations.
 */
export const useNotifications = (limit?: number) => {
    return useQuery({
        queryKey: [...NOTIFICATIONS_KEY, limit],
        queryFn: () => notificationsApi.getMyNotifications(limit),
        staleTime: 1000 * 30, // 30 seconds
        refetchOnWindowFocus: true,
    });
};

/**
 * Hook to get the unread count for the bell badge.
 * Polled more aggressively since it's shown persistently in the Navbar.
 */
export const useUnreadCount = () => {
    return useQuery({
        queryKey: UNREAD_COUNT_KEY,
        queryFn: notificationsApi.getUnreadCount,
        staleTime: 1000 * 30,
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60, // Poll every 60s (no websockets yet)
    });
};

/** Invalidate notifications + count after any mutation */
const useInvalidate = () => {
    const qc = useQueryClient();
    return () => {
        qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
        qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    };
};

export const useMarkAsRead = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: notificationsApi.markAsRead,
        onSuccess: invalidate,
    });
};

export const useMarkAllAsRead = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: notificationsApi.markAllAsRead,
        onSuccess: () => {
            invalidate();
            toast.success('Todas las notificaciones marcadas como leídas');
        },
        onError: () => toast.error('No se pudo actualizar las notificaciones'),
    });
};
