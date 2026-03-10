import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PeriodClosingPanel } from './PeriodClosingPanel';
import { PeriodTimeline } from './PeriodTimeline';

export function PeriodsTab() {
    const currentDate = new Date();
    // Default to the previous month since typically we close the month that just ended.
    const defaultDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    const [year, setYear] = useState<number>(defaultDate.getFullYear());
    const [month, setMonth] = useState<number>(defaultDate.getMonth() + 1);

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800">Cierre de Período</h3>
                    <p className="text-sm text-slate-500">Gestione el congelamiento mensual contable</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                        <SelectTrigger className="w-[140px] bg-slate-50">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-[100px] bg-slate-50"
                    />
                </div>
            </div>

            <div className="max-w-4xl">
                <PeriodClosingPanel year={year} month={month} />

                <PeriodTimeline
                    selectedYear={year}
                    selectedMonth={month}
                    onSelectMonth={(y, m) => {
                        setYear(y);
                        setMonth(m);
                    }}
                />
            </div>
        </div>
    );
}
