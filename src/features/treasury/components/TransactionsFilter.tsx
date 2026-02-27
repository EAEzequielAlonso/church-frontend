
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterX, ListFilter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TransactionCategoryModel, TreasuryAccountModel } from "../types/treasury.types";
import { useState, useEffect } from "react";

export interface FilterCriteria {
    startDate?: Date;
    endDate?: Date;
    type?: 'income' | 'expense' | 'transfer';
    categoryId?: string;
    accountId?: string;
}

interface TransactionsFilterProps {
    categories: TransactionCategoryModel[];
    accounts: TreasuryAccountModel[];
    onFilterChange: (filters: FilterCriteria) => void;
    initialFilters?: FilterCriteria; // NEW PROP
}

export function TransactionsFilter({ categories, accounts, onFilterChange, initialFilters }: TransactionsFilterProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(initialFilters?.startDate);
    const [endDate, setEndDate] = useState<Date | undefined>(initialFilters?.endDate);
    const [type, setType] = useState<string | undefined>(initialFilters?.type);
    const [categoryId, setCategoryId] = useState<string | undefined>(initialFilters?.categoryId);
    const [accountId, setAccountId] = useState<string | undefined>(initialFilters?.accountId);

    // useEffect removed to prevent auto-filtering

    const handleFilter = () => {
        onFilterChange({
            startDate,
            endDate,
            type: (type === 'all' || !type) ? undefined : type as any,
            categoryId: (categoryId === 'all' || !categoryId) ? undefined : categoryId,
            accountId: (accountId === 'all' || !accountId) ? undefined : accountId
        });
    };

    const handleClear = () => {
        // Reset to current month
        const now = new Date();
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        setType(undefined);
        setCategoryId(undefined);
        setAccountId(undefined);
    };

    // Filter categories based on selected type
    const filteredCategories = categories.filter(c => {
        if (!type || type === 'all' || type === 'transfer') return true;
        return c.type === type; // type is now lowercase 'income' or 'expense'
    });

    return (
        <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
            {/* Date Range */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal bg-white h-9",
                            !startDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                            endDate ? (
                                <>
                                    {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
                                </>
                            ) : (
                                format(startDate, "dd/MM/yyyy")
                            )
                        ) : (
                            <span>Filtrar por fecha</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={startDate}
                        selected={{ from: startDate, to: endDate }}
                        onSelect={(range) => {
                            setStartDate(range?.from);
                            setEndDate(range?.to);
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            {/* Type */}
            <Select value={type} onValueChange={(val) => {
                setType(val);
                setCategoryId('all'); // Reset category when type changes
            }}>
                <SelectTrigger className="w-[140px] bg-white h-9">
                    <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Ingresos</SelectItem>
                    <SelectItem value="expense">Egresos</SelectItem>
                    <SelectItem value="transfer">Transferencias</SelectItem>
                </SelectContent>
            </Select>

            {/* Category */}
            {type !== 'transfer' && (
                <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="w-[180px] bg-white h-9">
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Array.from(new Map(filteredCategories.map(c => [c.id, c])).values()).map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Account */}
            <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-[180px] bg-white h-9">
                    <SelectValue placeholder="Cuenta" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Array.from(new Map(accounts.map(a => [a.id, a])).values()).map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button onClick={handleFilter} className="h-9 bg-slate-900 text-white hover:bg-slate-800">
                <ListFilter className="mr-2 h-4 w-4" />
                Filtrar
            </Button>

            <Button variant="ghost" size="sm" onClick={handleClear} className="ml-auto h-9 text-slate-500 hover:text-rose-600" title="Limpiar todos los filtros">
                <FilterX className="mr-2 h-4 w-4" />
                Limpiar
            </Button>
        </div>
    );
}
