import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { sequelize } from '../../../../config/database';
import {
  RecurringTransaction,
  RecurrenceFrequency,
  Transaction,
  Account,
  TransactionStatus,
  TransactionType,
} from '../../../../database/models';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { CurrencyService } from '../../../../lib/currency';
import { ensureDatabaseReady } from '../../../../lib/db';

function calculateNextDate(currentDateStr: string, freq: RecurrenceFrequency, interval: number): string {
  const d = new Date(currentDateStr);
  switch (freq) {
    case RecurrenceFrequency.DAILY:
      d.setUTCDate(d.getUTCDate() + interval);
      break;
    case RecurrenceFrequency.WEEKLY:
      d.setUTCDate(d.getUTCDate() + 7 * interval);
      break;
    case RecurrenceFrequency.BIWEEKLY:
      d.setUTCDate(d.getUTCDate() + 14 * interval);
      break;
    case RecurrenceFrequency.MONTHLY:
      d.setUTCMonth(d.getUTCMonth() + interval);
      break;
    case RecurrenceFrequency.YEARLY:
      d.setUTCFullYear(d.getUTCFullYear() + interval);
      break;
  }
  return d.toISOString().split('T')[0];
}

export async function POST() {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const rates = await CurrencyService.getExchangeRates();

    const pendingRecurrings = await RecurringTransaction.findAll({
      where: {
        userId: user.id,
        isActive: true,
        nextExecutionDate: { [Op.lte]: today },
        [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }],
      },
    });

    let executedCount = 0;

    for (const item of pendingRecurrings) {
      await sequelize.transaction(async (t) => {
        const account = await Account.findOne({
          where: { id: item.accountId, userId: user.id },
          transaction: t,
        });

        if (!account) return;

        const { convertedAmount: amountInBase, exchangeRate: rateToBase } = CurrencyService.convert(
          item.amount,
          item.currencyCode,
          user.baseCurrencyCode,
          rates
        );

        await Transaction.create(
          {
            userId: user.id,
            accountId: item.accountId,
            categoryId: item.categoryId,
            recurringTransactionId: item.id,
            amount: item.amount,
            type: item.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
            currencyCode: item.currencyCode,
            exchangeRateToBase: rateToBase,
            amountInBaseCurrency: amountInBase,
            date: item.nextExecutionDate,
            description: `[Automático] ${item.description}`,
            status: TransactionStatus.COMPLETED,
          },
          { transaction: t }
        );

        const delta = item.type === 'INCOME' ? Number(item.amount) : -Number(item.amount);
        account.currentBalance = Number(account.currentBalance) + delta;
        await account.save({ transaction: t });

        const nextDate = calculateNextDate(item.nextExecutionDate, item.frequency, item.intervalCount);
        item.lastExecutionDate = item.nextExecutionDate;
        item.nextExecutionDate = nextDate;

        if (item.endDate && nextDate > item.endDate) {
          item.isActive = false;
        }

        await item.save({ transaction: t });
        executedCount++;
      });
    }

    return NextResponse.json({
      success: true,
      message: `Se procesaron ${executedCount} transacciones recurrentes pendientes.`,
      data: { executedCount },
    });
  } catch (error) {
    console.error('Error en POST /api/recurring/process:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar transacciones recurrentes.' },
      { status: 500 }
    );
  }
}
