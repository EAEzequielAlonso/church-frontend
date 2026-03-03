'use client';
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
    useUnreadCount,
    useNotifications,
    useMarkAsRead,
    useMarkAllAsRead,
} from '../hooks/useNotifications';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const TYPE_ICON: Record<string, string> = {
    LOAN_REQUESTED: '📚',
    LOAN_APPROVED: '✅',
    LOAN_REJECTED: '❌',
    LOAN_RETURNED: '↩️',
    GENERIC: '🔔',
};

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const { data: unreadCount = 0 } = useUnreadCount();
    const { data: notifications = [], isLoading } = useNotifications(5);
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();

    const handleClick = async (id: string, entityType?: string, entityId?: string) => {
        await markAsRead.mutateAsync(id);
        setOpen(false);
        if (entityType === 'LOAN') {
            router.push('/library?tab=my-loans');
        }
    };

    const handleViewAll = () => {
        setOpen(false);
        router.push('/notifications');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-80 p-0 shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <span className="font-semibold text-sm text-slate-800">Notificaciones</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2"
                            onClick={() => markAllAsRead.mutate()}
                            disabled={markAllAsRead.isPending}
                        >
                            {markAllAsRead.isPending
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <><CheckCheck className="w-3 h-3 mr-1" /> Leer todas</>
                            }
                        </Button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Sin notificaciones
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => handleClick(n.id, n.entityType, n.entityId)}
                                className={cn(
                                    'w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0',
                                    !n.read && 'bg-indigo-50/60'
                                )}
                            >
                                <span className="text-lg leading-none mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={cn('text-xs font-semibold text-slate-800 truncate', !n.read && 'text-slate-900')}>
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                                {!n.read && (
                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-slate-600 hover:text-slate-800"
                        onClick={handleViewAll}
                    >
                        Ver todas las notificaciones
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
