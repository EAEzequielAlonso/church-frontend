
import { useState } from "react";
import { TreasuryTransactionModel } from "../types/treasury.types";
import { TreasuryStats } from "./TreasuryStats";
import { TreasuryReportsCharts } from "./TreasuryReportsCharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getReportPPT } from "../api/treasury.api";
import { toast } from "sonner";
import { useMinistries } from "../hooks/useMinistries";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import * as api from "../api/treasury.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { TransactionsTable } from "./TransactionsTable";
import { List } from "lucide-react";

interface TreasuryReportsProps {
    transactions: TreasuryTransactionModel[];
}

export function TreasuryReports({ transactions }: TreasuryReportsProps) {
    const { churchId } = useAuth();
    // Default to current month
    const now = new Date();
    const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
    const [selectedMinistryId, setSelectedMinistryId] = useState<string>("all");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const [appliedFilters, setAppliedFilters] = useState({
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
        ministryId: "all",
        categoryId: "all"
    });
    const [isDownloadingPPT, setIsDownloadingPPT] = useState(false);

    // New state for interaction
    const [showResults, setShowResults] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleApplyFilters = () => {
        setAppliedFilters({
            startDate,
            endDate,
            ministryId: selectedMinistryId,
            categoryId: selectedCategoryId
        });
        setShowResults(true);
        setShowDetails(false); // Reset details on new filter
    };

    const { ministries } = useMinistries();
    const { categories } = useCategories(); // Fetch ALL categories

    // Fetch Budgets for the current year (derived from startDate)
    const year = new Date(appliedFilters.startDate).getFullYear();
    const { data: budgets } = useSWR(
        churchId ? `/treasury/budgets?churchId=${churchId}&year=${year}` : null,
        () => api.getBudgets(churchId!, year)
    );

    // ... (logic continues)

    // Helper to group categories
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        const start = new Date(appliedFilters.startDate);
        const end = new Date(appliedFilters.endDate);
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);

        const dateMatch = d >= start && d <= end;

        // Ministry Match
        const ministryName = ministries.find(m => m.id === appliedFilters.ministryId)?.name;
        const minMatch = appliedFilters.ministryId === "all" || (ministryName && t.ministryName === ministryName);

        // Category Match
        const categoryMatch = appliedFilters.categoryId === "all" || t.categoryId === appliedFilters.categoryId || t.categoryName === categories.find(c => c.id === appliedFilters.categoryId)?.name;

        return dateMatch && minMatch && categoryMatch;
    });

    const handleDownloadPPT = async () => {
        if (!churchId) return;
        setIsDownloadingPPT(true);
        try {
            const blob = await getReportPPT(churchId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-tesoreria-${appliedFilters.endDate}.pptx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success('Reporte PPT descargado');
        } catch (error) {
            toast.error('Error al descargar PPT');
        } finally {
            setIsDownloadingPPT(false);
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("Reporte de Tesorería", 14, 22);

        doc.setFontSize(11);
        doc.text(`Desde: ${format(new Date(appliedFilters.startDate), 'dd/MM/yyyy')}  Hasta: ${format(new Date(appliedFilters.endDate), 'dd/MM/yyyy')}`, 14, 30);

        // Stats Summary
        const income = filteredTransactions
            .filter(t => t.isIncome && t.status === 'completed')
            .reduce((acc, t) => acc + t.amount, 0);
        const expense = filteredTransactions
            .filter(t => t.isExpense && t.status === 'completed')
            .reduce((acc, t) => acc + t.amount, 0);

        doc.text(`Ingresos Totales: $${income}`, 14, 40);
        doc.text(`Egresos Totales: $${expense}`, 80, 40);
        doc.text(`Balance: $${income - expense}`, 150, 40);

        // Table
        const tableData = filteredTransactions.map(t => [
            format(new Date(t.date), 'dd/MM/yyyy'),
            t.description,
            t.isIncome ? 'Ingreso' : 'Egreso',
            t.isIncome ? (t.categoryName || t.sourceAccountName || '-') : (t.sourceAccountName || '-'),
            t.isExpense ? (t.categoryName || t.destinationAccountName || '-') : (t.destinationAccountName || '-'),
            `$${t.amount}`
        ]);

        autoTable(doc, {
            head: [['Fecha', 'Descripción', 'Tipo', 'Origen', 'Destino', 'Monto']],
            body: tableData,
            startY: 50,
        });

        doc.save(`reporte-tesoreria-${appliedFilters.endDate}.pdf`);
        toast.success('Reporte PDF generado');
    };

    const handleDownloadCSV = () => {
        // Headers
        const headers = ['Fecha', 'Descripción', 'Tipo', 'Monto', 'Moneda', 'Categoría/Origen', 'Destino', 'Estado', 'Ministerio'];

        // Rows
        const rows = filteredTransactions.map(t => [
            format(new Date(t.date), 'yyyy-MM-dd'),
            `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
            t.isIncome ? 'INGRESO' : t.isExpense ? 'EGRESO' : 'TRANSFERENCIA',
            t.amount,
            t.currency,
            `"${(t.isIncome ? (t.categoryName || t.sourceAccountName) : t.sourceAccountName || '').replace(/"/g, '""')}"`,
            `"${(t.isExpense ? (t.categoryName || t.destinationAccountName) : t.destinationAccountName || '').replace(/"/g, '""')}"`,
            t.status,
            t.ministryName || ''
        ]);

        // Combine
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte-tesoreria-${appliedFilters.startDate}_${appliedFilters.endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Reporte CSV descargado');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Filtros y Exportación</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownloadCSV} title="Exportar a Excel/CSV">
                            <FileText className="mr-2 h-4 w-4 text-green-600" />
                            CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                            <FileText className="mr-2 h-4 w-4 text-red-600" />
                            PDF
                        </Button>
                        <Button variant="default" size="sm" onClick={handleDownloadPPT} disabled={isDownloadingPPT}>
                            <Download className="mr-2 h-4 w-4" />
                            {isDownloadingPPT ? 'Generando...' : 'PowerPoint'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Fecha Inicio</label>
                                <input
                                    type="date"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Fecha Fin</label>
                                <input
                                    type="date"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2 min-w-[200px]">
                                <label className="text-sm font-medium">Ministerio</label>
                                <Select value={selectedMinistryId} onValueChange={setSelectedMinistryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {Array.from(new Map(ministries.map(m => [m.id, m])).values()).map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2 min-w-[200px]">
                                <label className="text-sm font-medium">Categoría</label>
                                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>

                                        {incomeCategories.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>Ingresos</SelectLabel>
                                                {Array.from(new Map(incomeCategories.map(c => [c.name, c])).values()).map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}

                                        {expenseCategories.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>Egresos</SelectLabel>
                                                {Array.from(new Map(expenseCategories.map(c => [c.name, c])).values()).map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleApplyFilters} className="mb-[2px]">
                                Aplicar Filtros
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showResults && (
                <>
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <List className="mr-2 h-4 w-4" />
                            {showDetails ? 'Ocultar Detalle' : 'Ver Detalle'}
                        </Button>
                    </div>

                    {!showDetails ? (
                        <>
                            <TreasuryStats transactions={filteredTransactions} />
                            <TreasuryReportsCharts
                                transactions={filteredTransactions}
                                budgets={budgets || []}
                            />
                        </>
                    ) : (
                        <TransactionsTable
                            transactions={filteredTransactions}
                            canEdit={false} // Reports view usually readonly
                            page={1} // Simple view for now, or implement pagination?
                            totalPages={1}
                            onPageChange={() => { }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
