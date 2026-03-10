import React, { useMemo } from 'react';
import { TimelineMonthItem } from './TimelineMonthItem';

interface PeriodTimelineProps {
    selectedYear: number;
    selectedMonth: number;
    onSelectMonth: (year: number, month: number) => void;
}

export function PeriodTimeline({ selectedYear, selectedMonth, onSelectMonth }: PeriodTimelineProps) {
    const timelineMonths = useMemo(() => {
        const months = [];
        // Generamos los últimos 12 meses finalizando en el mes seleccionado.
        for (let i = 11; i >= 0; i--) {
            // Usamos Date para manejar correctamente los cambios de año (ej. Enero - 1 = Diciembre del año anterior)
            const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
            months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
        }
        return months;
    }, [selectedYear, selectedMonth]);

    return (
        <div className="space-y-3 mt-8">
            <h3 className="text-sm font-semibold text-slate-700">Historial de Períodos (Últimos 12 meses)</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-200">
                {timelineMonths.map((m) => (
                    <div key={`${m.year}-${m.month}`} className="snap-start shrink-0">
                        <TimelineMonthItem
                            year={m.year}
                            month={m.month}
                            isSelected={m.year === selectedYear && m.month === selectedMonth}
                            onSelect={onSelectMonth}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
