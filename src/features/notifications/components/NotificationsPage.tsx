'use client';
import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, CheckCheck, Loader2, AlertTriangle } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type Filter = 'ALL' | 'UNREAD';

const TYPE_ICON: Record<string, string> = {
    LOAN_REQUESTED: '📚',
    LOAN_APPROVED: '✅',
    LOAN_REJECTED: '❌',
    LOAN_RETURNED: '↩️',
    GENERIC: '🔔',
};

export default function NotificationsPage() {
    const [filter, setFilter] = useState<Filter>('ALL');
    const { data: all = [], isLoading, error } = useNotifications(100);
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();

    const notifications = filter === 'UNREAD' ? all.filter(n => !n.read) : all;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>No se pudieron cargar las notificaciones.</AlertDescription>
                </Alert>
            </div>
        );
    }

    const unreadCount = all.filter(n => !n.read).length;

    return (
        <div className="container mx-auto py-8 max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="w-6 h-6" /> Notificaciones
                    </h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-slate-500 mt-0.5">
                            {unreadCount} sin leer
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllAsRead.mutate()}
                        disabled={markAllAsRead.isPending}
                        className="gap-2"
                    >
                        {markAllAsRead.isPending
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCheck className="w-4 h-4" />
                        }
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(['ALL', 'UNREAD'] as Filter[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                            filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                    >
                        {f === 'ALL' ? 'Todas' : 'No leídas'}
                    </button>
                ))}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Bell className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 text-lg font-medium">Sin notificaciones</p>
                    <p className="text-slate-400 text-sm mt-1">
                        {filter === 'UNREAD' ? 'Estás al día!' : 'Todavía no recibiste ninguna.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={cn(
                                'rounded-2xl border p-4 flex gap-4 items-start transition-all',
                                n.read
                                    ? 'bg-white border-slate-200'
                                    : 'bg-indigo-50/50 border-indigo-200'
                            )}
                        >
                            <span className="text-2xl leading-none mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={cn('text-sm font-semibold', n.read ? 'text-slate-700' : 'text-slate-900')}>
                                        {n.title}
                                    </p>
                                    {!n.read && (
                                        <span className="shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                                </p>
                            </div>

                            {!n.read && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 text-xs text-indigo-600 hover:bg-indigo-100 px-2.5"
                                    onClick={() => markAsRead.mutate(n.id)}
                                    disabled={markAsRead.isPending}
                                >
                                    Marcar leída
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
