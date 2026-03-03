import api from '@/lib/api';

export interface NotificationDto {
    id: string;
    churchId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    read: boolean;
    readAt?: string;
    createdAt: string;
}

export const notificationsApi = {
    /** Fetch the most recent notifications (default: 20) */
    getMyNotifications: async (limit = 20): Promise<NotificationDto[]> => {
        const { data } = await api.get<NotificationDto[]>('/notifications', { params: { limit } });
        return data;
    },

    /** Get the unread count for the bell badge */
    getUnreadCount: async (): Promise<number> => {
        const { data } = await api.get<{ count: number }>('/notifications/unread-count');
        return data.count;
    },

    /** Mark a single notification as read */
    markAsRead: async (id: string): Promise<NotificationDto> => {
        const { data } = await api.patch<NotificationDto>(`/notifications/${id}/read`);
        return data;
    },

    /** Mark all notifications as read */
    markAllAsRead: async (): Promise<void> => {
        await api.post('/notifications/read-all');
    },
};
