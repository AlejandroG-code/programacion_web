import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFReportData {
  userName: string;
  userEmail: string;
  baseCurrencyCode: string;
  periodLabel: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRate: number;
  };
  categoryDistribution: Array<{
    name: string;
    total: number;
    percentage: number;
  }>;
  transactions: Array<{
    date: string;
    description: string;
    accountName: string;
    categoryName: string;
    type: string;
    amount: number;
    currencyCode: string;
    amountInBase: number;
  }>;
}

export function generateFinancialPDF(data: PDFReportData): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [37, 99, 235]; // Tailwind Blue 600
  const darkTextColor: [number, number, number] = [30, 41, 59]; // Slate 800
  const lightBgColor: [number, number, number] = [248, 250, 252]; // Slate 50

  // 1. Encabezado / Branding
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANZAS PERSONALES PRO', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Estado Financiero y Desglose Contable', 14, 21);

  doc.text(`Periodo: ${data.periodLabel}`, 196, 14, { align: 'right' });
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 196, 21, { align: 'right' });

  // 2. Información del Usuario
  let currentY = 36;
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TITULAR DEL REPORTE:', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.text(`${data.userName} (${data.userEmail})`, 65, currentY);
  doc.text(`Divisa Base: ${data.baseCurrencyCode}`, 196, currentY, { align: 'right' });

  currentY += 8;

  // 3. Tarjetas de Resumen Financiero (KPIs)
  const cardWidth = 43;
  const cardHeight = 20;
  const cards = [
    { label: 'INGRESOS TOTALES', value: `+${data.summary.totalIncome.toLocaleString()} ${data.baseCurrencyCode}`, color: [16, 185, 129] }, // Green
    { label: 'GASTOS TOTALES', value: `-${data.summary.totalExpense.toLocaleString()} ${data.baseCurrencyCode}`, color: [239, 68, 68] }, // Red
    { label: 'FLUJO NETO', value: `${data.summary.netSavings >= 0 ? '+' : ''}${data.summary.netSavings.toLocaleString()} ${data.baseCurrencyCode}`, color: data.summary.netSavings >= 0 ? [37, 99, 235] : [239, 68, 68] },
    { label: 'TASA DE AHORRO', value: `${data.summary.savingsRate}%`, color: [139, 92, 246] }, // Purple
  ];

  cards.forEach((card, i) => {
    const x = 14 + i * (cardWidth + 4);
    doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 4, currentY + 6);

    doc.setFontSize(10);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, x + 4, currentY + 14);
  });

  currentY += cardHeight + 10;

  // 4. Tabla de Distribución de Gastos por Categoría
  if (data.categoryDistribution.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text('Distribución de Gastos por Categoría', 14, currentY);
    currentY += 4;

    const categoryRows = data.categoryDistribution.map(c => [
      c.name,
      `$ ${c.total.toLocaleString()} ${data.baseCurrencyCode}`,
      `${c.percentage}%`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Categoría', 'Total Gastado (En Base)', '% del Gasto Total']],
      body: categoryRows,
      theme: 'striped',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: darkTextColor,
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // 5. Tabla de Movimientos y Transacciones Detalladas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('Historial Detallado de Transacciones', 14, currentY);
  currentY += 4;

  const transactionRows = data.transactions.map(t => [
    t.date,
    t.description,
    t.accountName,
    t.categoryName,
    t.type === 'INCOME' ? 'Ingreso' : t.type === 'EXPENSE' ? 'Gasto' : 'Transferencia',
    `${t.type === 'INCOME' ? '+' : t.type === 'EXPENSE' ? '-' : ''}${t.amount.toLocaleString()} ${t.currencyCode}`,
    `$ ${t.amountInBase.toLocaleString()} ${data.baseCurrencyCode}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Fecha', 'Descripción', 'Cuenta', 'Categoría', 'Tipo', 'Monto Original', 'Equivalente Base']],
    body: transactionRows.length > 0 ? transactionRows : [['-', 'Sin movimientos en este periodo', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkTextColor,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 45 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 26, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // 6. Pie de Página con Paginación
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} | Generado por Finanzas Personales Pro | Confidencial`,
      105,
      290,
      { align: 'center' }
    );
  }

  return new Uint8Array(doc.output('arraybuffer'));
}
