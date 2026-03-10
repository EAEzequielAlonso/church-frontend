import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMinistries } from '../../hooks/useMinistries';
import { useCategories } from '../../hooks/useCategories';
import { ReportFilters } from '../types/reports.types';
import { X } from 'lucide-react';

interface ReportsFiltersProps {
    filters: ReportFilters;
    onFiltersChange: (newFilters: ReportFilters) => void;
}

export function ReportsFilters({ filters, onFiltersChange }: ReportsFiltersProps) {
    const { ministries } = useMinistries();
    const { categories: incomeCats } = useCategories('income');
    const { categories: expenseCats } = useCategories('expense');

    // Combine categories for filtering purposes if needed, or group them.
    const allCategories = [...incomeCats, ...expenseCats];

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({ ...filters, startDate: e.target.value });
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({ ...filters, endDate: e.target.value });
    };

    const handleMinistryChange = (value: string) => {
        onFiltersChange({ ...filters, ministryId: value === 'all' ? undefined : value });
    };

    const handleCategoryChange = (value: string) => {
        onFiltersChange({ ...filters, categoryId: value === 'all' ? undefined : value });
    };

    const clearFilters = () => {
        onFiltersChange({
            ...filters,
            ministryId: undefined,
            categoryId: undefined,
        });
    };

    const hasActiveFilters = !!filters.ministryId || !!filters.categoryId;

    return (
        <Card className="mb-6 bg-white shadow-sm border-slate-200">
            <CardContent className="p-4 flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5 flex-1 min-w-[200px] max-w-[250px]">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Período Desde</label>
                    <Input
                        type="date"
                        value={filters.startDate}
                        onChange={handleStartDateChange}
                        className="bg-slate-50"
                    />
                </div>

                <div className="space-y-1.5 flex-1 min-w-[200px] max-w-[250px]">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Período Hasta</label>
                    <Input
                        type="date"
                        value={filters.endDate}
                        onChange={handleEndDateChange}
                        className="bg-slate-50"
                    />
                </div>

                <div className="space-y-1.5 flex-1 min-w-[200px] max-w-[250px]">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Ministerio</label>
                    <Select value={filters.ministryId || 'all'} onValueChange={handleMinistryChange}>
                        <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Todos los ministerios" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los ministerios</SelectItem>
                            {ministries.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 flex-1 min-w-[200px] max-w-[250px]">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Categoría</label>
                    <Select value={filters.categoryId || 'all'} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            <optgroup label="Ingresos">
                                {incomeCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </optgroup>
                            <optgroup label="Egresos">
                                {expenseCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </optgroup>
                        </SelectContent>
                    </Select>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-slate-500 hover:text-slate-800 h-10 px-3"
                        title="Limpiar filtros"
                    >
                        <X className="w-4 h-4 mr-1" /> Limpiar
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
