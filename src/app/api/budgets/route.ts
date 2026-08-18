import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Op } from 'sequelize';
import Decimal from 'decimal.js';
import { Budget, Category, Transaction, TransactionType, TransactionStatus } from '../../../database/models';
import { getAuthenticatedUser } from '../../../lib/auth';
import { ensureDatabaseReady } from '../../../lib/db';

const budgetSchema = z.object({
  categoryId: z.string().uuid('ID de categoría no válido'),
  monthlyLimit: z.number().positive('El límite mensual debe ser mayor a 0'),
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2000).max(2100),
});

export async function GET(req: Request) {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || String(now.getUTCMonth() + 1), 10);
    const year = parseInt(searchParams.get('year') || String(now.getUTCFullYear()), 10);

    const budgets = await Budget.findAll({
      where: {
        userId: user.id,
        periodMonth: month,
        periodYear: year,
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color', 'type'] },
      ],
      order: [['created_at', 'ASC']],
    });

    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    let totalBudgeted = 0;
    let totalSpent = 0;

    const detailedBudgets = await Promise.all(
      budgets.map(async (b) => {
        const spentSum = (await Transaction.sum('amountInBaseCurrency', {
          where: {
            userId: user.id,
            categoryId: b.categoryId,
            type: TransactionType.EXPENSE,
            status: TransactionStatus.COMPLETED,
            date: { [Op.between]: [startOfMonth, endOfMonth] },
          },
        })) || 0;

        const limit = Number(b.monthlyLimit);
        const spent = Number(spentSum);
        const remaining = Math.round((limit - spent) * 100) / 100;
        const percentage = limit > 0 ? Math.round((spent / limit) * 1000) / 10 : 0;

        totalBudgeted += limit;
        totalSpent += spent;

        let alertLevel: 'OK' | 'WARNING_80' | 'EXCEEDED_100' = 'OK';
        if (percentage >= 100) {
          alertLevel = 'EXCEEDED_100';
        } else if (percentage >= 80) {
          alertLevel = 'WARNING_80';
        }

        return {
          id: b.id,
          categoryId: b.categoryId,
          category: b.category,
          monthlyLimit: limit,
          totalSpent: Math.round(spent * 100) / 100,
          remainingAmount: remaining,
          executionPercentage: percentage,
          alertLevel,
          currencyCode: user.baseCurrencyCode,
          periodMonth: b.periodMonth,
          periodYear: b.periodYear,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        budgets: detailedBudgets,
        month,
        year,
        baseCurrencyCode: user.baseCurrencyCode,
        summary: {
          totalBudgeted: Math.round(totalBudgeted * 100) / 100,
          totalSpent: Math.round(totalSpent * 100) / 100,
          totalRemaining: Math.round((totalBudgeted - totalSpent) * 100) / 100,
          overallPercentage: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 1000) / 10 : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error en GET /api/budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Error al consultar presupuestos.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = budgetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { categoryId, monthlyLimit, periodMonth, periodYear } = validation.data;

    // Verificar o crear presupuesto
    const [budget, created] = await Budget.findOrCreate({
      where: {
        userId: user.id,
        categoryId,
        periodMonth,
        periodYear,
      },
      defaults: {
        userId: user.id,
        categoryId,
        monthlyLimit,
        currencyCode: user.baseCurrencyCode,
        periodMonth,
        periodYear,
      },
    });

    if (!created) {
      budget.monthlyLimit = monthlyLimit;
      await budget.save();
    }

    return NextResponse.json({
      success: true,
      message: created ? 'Presupuesto creado exitosamente' : 'Presupuesto actualizado exitosamente',
      data: { budget },
    }, { status: created ? 201 : 200 });
  } catch (error) {
    console.error('Error en POST /api/budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar presupuesto.' },
      { status: 500 }
    );
  }
}
