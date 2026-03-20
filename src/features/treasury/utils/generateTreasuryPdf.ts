import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PdfReportData {
    churchName: string;
    startDate: Date;
    endDate: Date;
    summary: {
        income: number;
        expense: number;
        net: number;
    };
    transactions: any[];
    incomeCategories: any[];
    expenseCategories: any[];
    accounts: any[];
}

export const generateTreasuryPdf = (data: PdfReportData) => {
    const doc = new jsPDF();
    const { churchName, startDate, endDate, summary, transactions, incomeCategories, expenseCategories, accounts } = data;

    // --- Header ---
    doc.setFontSize(26);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(churchName.toUpperCase(), 14, 25);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('Resumen de Tesorería - Informe de Gestión', 14, 34);
    
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.text(`Desde: ${format(startDate, 'PPPP', { locale: es })}`, 14, 42);
    doc.text(`Hasta: ${format(endDate, 'PPPP', { locale: es })}`, 14, 47);
    
    // --- Line separator ---
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(14, 52, 196, 52);

    // --- Totals Section (Professional Look) ---
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(14, 60, 56, 30, 3, 3, 'F');
    doc.roundedRect(77, 60, 56, 30, 3, 3, 'F');
    doc.roundedRect(140, 60, 56, 30, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text('INGRESOS DEL PERIODO', 19, 68);
    doc.text('GASTOS DEL PERIODO', 82, 68);
    doc.text('BALANCE NETO', 145, 68);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74); // Green 600
    doc.text(`$${Number(summary.income).toLocaleString('es-AR')}`, 19, 82);
    
    doc.setTextColor(220, 38, 38); // Red 600
    doc.text(`$${Number(summary.expense).toLocaleString('es-AR')}`, 82, 82);
    
    const netColor = summary.net >= 0 ? [22, 163, 74] : [220, 38, 38];
    doc.setTextColor(netColor[0], netColor[1], netColor[2]);
    doc.text(`$${Number(summary.net).toLocaleString('es-AR')}`, 145, 82);

    doc.setFont('helvetica', 'normal');

    // --- Accounts Summary ---
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Estado de Cuentas (Saldos Actuales)', 14, 105);

    const accountRows = accounts.map(acc => [
        acc.name,
        acc.type === 'CASH' ? 'Efectivo' : 'Banco',
        acc.currency,
        `$${Number(acc.balance).toLocaleString('es-AR')}`
    ]);

    autoTable(doc, {
        startY: 110,
        head: [['Nombre de Cuenta', 'Tipo', 'Moneda', 'Saldo Actual']],
        body: accountRows,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105], fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
    });

    // --- Category Breakdown ---
    const currentY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(14);
    doc.text('Desglose por Categoría (Gastos)', 14, currentY + 15);

    const totalExp = expenseCategories.reduce((acc, cat) => acc + Number(cat.value), 0);
    const categoryRows = expenseCategories.slice(0, 10).map(cat => {
        const val = Number(cat.value);
        const percentage = totalExp > 0 ? (val / totalExp) * 100 : 0;
        return [
            cat.name,
            `$${val.toLocaleString('es-AR')}`,
            `${percentage.toFixed(1)}%`
        ];
    });

    autoTable(doc, {
        startY: currentY + 20,
        head: [['Categoría de Egreso', 'Total invertido', 'Porcentaje']],
        body: categoryRows,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85], fontSize: 10 },
        styles: { fontSize: 9 },
        columnStyles: { 
            1: { halign: 'right' },
            2: { halign: 'right' }
        }
    });

    // --- Detailed Movements ---
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Detalle Cronológico de Movimientos', 14, 20);

    const movementRows = transactions.map(tx => [
        format(new Date(tx.date), 'dd/MM/yyyy'),
        tx.description,
        tx.categoryName || '-',
        tx.isIncome ? 'Ingreso' : 'Egreso',
        `$${Number(tx.amount).toLocaleString('es-AR')}`
    ]);

    autoTable(doc, {
        startY: 25,
        head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
        body: movementRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            4: { halign: 'right', fontStyle: 'bold' }
        },
        didDrawCell: (data: any) => {
            if (data.section === 'body' && data.column.index === 4) {
                const row = transactions[data.row.index];
                if (row.isIncome) doc.setTextColor(22, 163, 74);
                else doc.setTextColor(220, 38, 38);
            }
        }
    });

    // --- Footer with page numbers ---
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        const footerText = `Página ${i} de ${pageCount} | Generado por Tesorería Pro | ${format(new Date(), 'Pp', { locale: es })}`;
        doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`Reporte_Tesoria_${format(startDate, 'MMMM_yyyy', { locale: es })}.pdf`);
};
