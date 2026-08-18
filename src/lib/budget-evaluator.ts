import Decimal from 'decimal.js';
import { Op, Transaction as SequelizeTransaction } from 'sequelize';
import { Budget, Transaction, TransactionType, TransactionStatus } from '../database/models';

export interface BudgetAlert {
  level: 'OK' | 'WARNING_80' | 'EXCEEDED_100';
  executionPercentage: number;
  monthlyLimit: number;
  totalSpent: number;
  remainingAmount: number;
  message: string;
  categoryName?: string;
}

export async function evaluateBudgetForCategory(
  userId: string,
  categoryId: string,
  dateStr: string,
  dbTransaction?: SequelizeTransaction
): Promise<BudgetAlert | null> {
  const date = new Date(dateStr);
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  const budget = await Budget.findOne({
    where: { userId, categoryId, periodMonth: month, periodYear: year },
    transaction: dbTransaction,
  });

  if (!budget) return null;

  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const totalSpentSum = (await Transaction.sum('amountInBaseCurrency', {
    where: {
      userId,
      categoryId,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.COMPLETED,
      date: { [Op.between]: [startOfMonth, endOfMonth] },
    },
    transaction: dbTransaction,
  })) || 0;

  const limit = new Decimal(budget.monthlyLimit);
  const spent = new Decimal(totalSpentSum);
  const remaining = limit.minus(spent);
  const percentage = limit.isZero() ? new Decimal(0) : spent.dividedBy(limit).times(100);
  const execPercent = percentage.toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toNumber();

  let level: 'OK' | 'WARNING_80' | 'EXCEEDED_100' = 'OK';
  let message = 'Presupuesto saludable.';

  if (execPercent >= 100) {
    level = 'EXCEEDED_100';
    message = `⚠️ ¡Límite superado! Has alcanzado el ${execPercent}% de tu presupuesto mensual en esta categoría.`;
  } else if (execPercent >= 80) {
    level = 'WARNING_80';
    message = `🔔 Advertencia de presupuesto: Has alcanzado el ${execPercent}% de tu presupuesto mensual.`;
  }

  return {
    level,
    executionPercentage: execPercent,
    monthlyLimit: limit.toNumber(),
    totalSpent: spent.toNumber(),
    remainingAmount: remaining.toNumber(),
    message,
  };
}
