import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { Transaction, Category, Account, TransactionType, TransactionStatus } from '../../../database/models';
import { getAuthenticatedUser } from '../../../lib/auth';
import { ensureDatabaseReady } from '../../../lib/db';

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

    // Rango anual
    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;

    const whereYear: any = {
      userId: user.id,
      status: TransactionStatus.COMPLETED,
      date: { [Op.between]: [startOfYear, endOfYear] },
    };

    const transactions = await Transaction.findAll({
      where: whereYear,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color', 'type'] },
        { model: Account, as: 'account', attributes: ['id', 'name', 'currencyCode'] },
      ],
      order: [['date', 'ASC']],
    });

    // 1. Desglose Mensual (Ene - Dic)
    const monthlyCashFlow = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return {
        month: m,
        monthName: monthNames[i],
        income: 0,
        expense: 0,
        savings: 0,
      };
    });

    let totalYearIncome = 0;
    let totalYearExpense = 0;

    // 2. Desglose por Categoría
    const categoryTotals: Record<string, { id: string; name: string; icon: string; color: string; total: number }> = {};
    let filteredExpenseTotal = 0;

    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const mIndex = d.getUTCMonth();
      const amt = Number(tx.amountInBaseCurrency);

      if (tx.type === TransactionType.INCOME) {
        monthlyCashFlow[mIndex].income += amt;
        totalYearIncome += amt;
      } else if (tx.type === TransactionType.EXPENSE) {
        monthlyCashFlow[mIndex].expense += amt;
        totalYearExpense += amt;

        // Si se filtró por mes específico o para todo el año
        if (month === null || (mIndex + 1) === month) {
          filteredExpenseTotal += amt;
          const catId = tx.categoryId || 'uncategorized';
          const catName = tx.category ? tx.category.name : 'Sin Categoría';
          const catColor = tx.category ? tx.category.color : '#9CA3AF';
          const catIcon = tx.category ? tx.category.icon : 'tag';

          if (!categoryTotals[catId]) {
            categoryTotals[catId] = {
              id: catId,
              name: catName,
              color: catColor,
              icon: catIcon,
              total: 0,
            };
          }
          categoryTotals[catId].total += amt;
        }
      }
    });

    // Calcular ahorro mensual
    monthlyCashFlow.forEach(m => {
      m.income = Math.round(m.income * 100) / 100;
      m.expense = Math.round(m.expense * 100) / 100;
      m.savings = Math.round((m.income - m.expense) * 100) / 100;
    });

    // Formatear distribución por categoría con porcentajes
    const expenseDistribution = Object.values(categoryTotals)
      .map(c => ({
        ...c,
        total: Math.round(c.total * 100) / 100,
        percentage: filteredExpenseTotal > 0 ? Math.round((c.total / filteredExpenseTotal) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const savingsRate = totalYearIncome > 0
      ? Math.round(((totalYearIncome - totalYearExpense) / totalYearIncome) * 1000) / 10
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        baseCurrencyCode: user.baseCurrencyCode,
        summary: {
          totalIncome: Math.round(totalYearIncome * 100) / 100,
          totalExpense: Math.round(totalYearExpense * 100) / 100,
          netSavings: Math.round((totalYearIncome - totalYearExpense) * 100) / 100,
          savingsRate,
        },
        monthlyCashFlow,
        expenseDistribution,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/reports:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar reporte financiero.' },
      { status: 500 }
    );
  }
}
