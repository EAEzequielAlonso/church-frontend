
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ReportsFiltersProps {
    startDate: Date;
    endDate: Date;
    onDateChange: (start: Date, end: Date) => void;
}

export function ReportsFilters({ startDate, endDate, onDateChange }: ReportsFiltersProps) {
    // Simplified Date Range Picker or just two inputs
    // Using simple inputs for speed and robustness for now, or Popover Calendar if available
    // Let's use standard HTML date inputs styled nicely or Shadcn Calendar if I knew it was fully set up.
    // I'll use standard inputs for reliability in this environment.

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-end mb-6 p-4 bg-card rounded-lg border shadow-sm">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground">Fecha Inicio</label>
                <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={startDate.toISOString().split('T')[0]}
                    onChange={(e) => onDateChange(new Date(e.target.value), endDate)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground">Fecha Fin</label>
                <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={endDate.toISOString().split('T')[0]}
                    onChange={(e) => onDateChange(startDate, new Date(e.target.value))}
                />
            </div>

            <div className="flex-1"></div>

            {/* Future: Export Buttons */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm">Exportar PDF</Button>
                <Button variant="outline" size="sm">Exportar CSV</Button>
            </div>
        </div>
    )
}
