import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePeriods } from '../hooks/usePeriods';
import { PeriodStatus } from '../types/period.types';

interface PeriodStatusBadgeProps {
    year: number;
    month: number;
}

export function PeriodStatusBadge({ year, month }: PeriodStatusBadgeProps) {
    const { churchId } = useAuth();
    const { period, isLoading } = usePeriods(churchId || '', year, month);

    if (isLoading) {
        return <Badge variant="outline" className="text-slate-400">Cargando...</Badge>;
    }

    const isClosed = period?.status === PeriodStatus.CLOSED;

    return (
        <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2.5 py-1 ${isClosed
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
        >
            {isClosed ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            <span>{isClosed ? 'Período Cerrado' : 'Período Abierto'}</span>
        </Badge>
    );
}
