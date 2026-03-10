import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePeriods } from '../hooks/usePeriods';
import { PeriodStatus } from '../types/period.types';
import { Lock, Unlock } from 'lucide-react';

interface TimelineMonthItemProps {
    year: number;
    month: number;
    isSelected: boolean;
    onSelect: (year: number, month: number) => void;
}

const shortMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function TimelineMonthItem({ year, month, isSelected, onSelect }: TimelineMonthItemProps) {
    const { churchId } = useAuth();
    // Consumimos el estado del período localmente. React Query cacheará / agrupará estos requests.
    const { period, isLoading } = usePeriods(churchId || '', year, month);

    const isCurrentRealMonth = new Date().getFullYear() === year && new Date().getMonth() + 1 === month;
    const isClosed = period?.status === PeriodStatus.CLOSED;

    return (
        <button
            type="button"
            onClick={() => onSelect(year, month)}
            disabled={isLoading}
            className={`
                flex flex-col items-center justify-center p-3 rounded-xl border transition-all min-w-[90px] h-full
                ${isSelected
                    ? 'ring-2 ring-primary border-primary shadow-sm bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm bg-white'
                }
                ${isLoading ? 'opacity-50 cursor-wait' : ''}
            `}
        >
            <span className="text-xs font-semibold text-slate-600 mb-2">
                {shortMonths[month - 1]} {year.toString().slice(-2)}
            </span>

            <div className={`
                p-2.5 rounded-full mb-2
                ${isClosed ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}
            `}>
                {isClosed ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </div>

            <span className={`text-[10px] uppercase font-bold tracking-wider ${isClosed ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isClosed ? 'Cerrado' : 'Abierto'}
            </span>

            {isCurrentRealMonth && (
                <span className="text-[9px] mt-1.5 text-blue-700 font-bold tracking-tight bg-blue-100 px-1.5 py-0.5 rounded">
                    ACTUAL
                </span>
            )}
        </button>
    );
}
