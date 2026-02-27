import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BudgetExecutionResponse } from '../types/budget.types';
import { formatCurrency } from '@/lib/utils';

export class BudgetPdfService {
    static generateReport(data: BudgetExecutionResponse, periodName: string, organizationName: string = 'Iglesia') {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // --- Header ---
        doc.setFontSize(20);
        doc.text(organizationName, 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Reporte de Ejecución Presupuestaria`, 14, 30);
        doc.text(`Periodo: ${periodName}`, 14, 36);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 42);

        // --- Summary Cards ---
        const startY = 50;
        const boxWidth = 40;
        const boxHeight = 20;
        const gap = 10;

        // Helper to draw summary box
        const drawBox = (x: number, title: string, value: string, color: [number, number, number] = [0, 0, 0]) => {
            doc.setDrawColor(220, 220, 220);
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'FD');

            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(title, x + 2, startY + 6);

            doc.setFontSize(10);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(value, x + 2, startY + 15);
            doc.setFont('helvetica', 'normal');
        };

        drawBox(14, "Presupuesto", formatCurrency(data.summary.totalBudget));
        drawBox(14 + boxWidth + gap, "Ejecutado", formatCurrency(data.summary.totalSpent));
        drawBox(14 + (boxWidth + gap) * 2, "Disponible", formatCurrency(data.summary.remaining), data.summary.remaining < 0 ? [220, 38, 38] : [22, 163, 74]);
        drawBox(14 + (boxWidth + gap) * 3, "% Uso", `${data.summary.usagePercentage.toFixed(1)}%`);

        // --- Details Table ---
        const tableColumn = ["Item", "Categoría", "Presupuesto", "Ejecutado", "Disponible", "%"];
        const tableRows: any[] = [];

        data.allocations.forEach(item => {
            const itemName = item.ministry ? item.ministry.name : "Global";
            const categoryName = item.category ? item.category.name : "-";

            tableRows.push([
                itemName,
                categoryName,
                formatCurrency(item.budgetAmount),
                formatCurrency(item.spentAmount),
                formatCurrency(item.remainingAmount),
                `${item.usagePercentage.toFixed(0)}%`
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: startY + 30,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 40 }, // Item
                1: { cellWidth: 40 }, // Category
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'right' },
            },
            didParseCell: function (data) {
                // Highlight negative available
                if (data.section === 'body' && data.column.index === 4) {
                    const val = data.cell.raw as string;
                    if (val.includes('-')) {
                        data.cell.styles.textColor = [220, 38, 38];
                    }
                }
            }
        });

        // --- Footer ---
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
        }

        doc.save(`Presupuesto_${periodName.replace(/\s/g, '_')}.pdf`);
    }
}
