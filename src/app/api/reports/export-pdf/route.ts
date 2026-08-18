import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { Transaction, Category, Account, TransactionStatus, TransactionType } from '../../../../database/models';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { generateFinancialPDF, PDFReportData } from '../../../../lib/pdf-generator';
import { ensureDatabaseReady } from '../../../../lib/db';

export async function GET(req: Request) {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = parseInt(searchParams.get('year') || String(now.getUTCFullYear()), 10);
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : null;

    let startDate: string;
    let endDate: string;
    let periodLabel: string;

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    if (month) {
      const lastDay = new Date(year, month, 0).getDate();
      startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      periodLabel = `${monthNames[month - 1]} ${year}`;
    } else {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
      periodLabel = `Año Completo ${year}`;
    }

    const transactions = await Transaction.findAll({
      where: {
        userId: user.id,
        status: TransactionStatus.COMPLETED,
        date: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        { model: Account, as: 'account', attributes: ['name'] },
      ],
      order: [['date', 'DESC']],
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const catMap: Record<string, number> = {};

    const formattedTx = transactions.map(t => {
      const amtBase = Number(t.amountInBaseCurrency);
      if (t.type === TransactionType.INCOME) totalIncome += amtBase;
      if (t.type === TransactionType.EXPENSE) {
        totalExpense += amtBase;
        const cName = t.category?.name || 'Sin Categoría';
        catMap[cName] = (catMap[cName] || 0) + amtBase;
      }

      return {
        date: t.date,
        description: t.description,
        accountName: t.account?.name || 'Cuenta',
        categoryName: t.category?.name || 'General',
        type: t.type,
        amount: Number(t.amount),
        currencyCode: t.currencyCode,
        amountInBase: amtBase,
      };
    });

    const categoryDistribution = Object.entries(catMap)
      .map(([name, total]) => ({
        name,
        total: Math.round(total * 100) / 100,
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const pdfPayload: PDFReportData = {
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      baseCurrencyCode: user.baseCurrencyCode,
      periodLabel,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        netSavings: Math.round((totalIncome - totalExpense) * 100) / 100,
        savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 1000) / 10 : 0,
      },
      categoryDistribution,
      transactions: formattedTx,
    };

    const pdfBuffer = generateFinancialPDF(pdfPayload);

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte_financiero_${year}_${month || 'anual'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error exportando PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar documento PDF.' },
      { status: 500 }
    );
  }
}
