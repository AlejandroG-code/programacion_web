import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Op } from 'sequelize';
import { sequelize } from '../../../config/database';
import {
  Transaction,
  Account,
  Category,
  TransactionType,
  TransactionStatus,
} from '../../../database/models';
import { getAuthenticatedUser } from '../../../lib/auth';
import { CurrencyService } from '../../../lib/currency';
import { evaluateBudgetForCategory } from '../../../lib/budget-evaluator';
import { ensureDatabaseReady } from '../../../lib/db';

const transactionSchema = z.object({
  accountId: z.string().uuid('ID de cuenta no válido'),
  categoryId: z.string().uuid('ID de categoría no válido').optional().nullable(),
  destinationAccountId: z.string().uuid('ID de cuenta destino no válido').optional().nullable(),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  type: z.nativeEnum(TransactionType),
  currencyCode: z.string().length(3).optional(),
  date: z.string().min(10, 'Fecha requerida (YYYY-MM-DD)'),
  description: z.string().min(2, 'La descripción es obligatoria'),
  notes: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: any = { userId: user.id };

    if (accountId) where.accountId = accountId;
    if (categoryId) where.categoryId = categoryId;
    if (type && Object.values(TransactionType).includes(type as any)) where.type = type;
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }
    if (search) {
      where.description = { [Op.iLike]: `%${search}%` };
    }

    const { rows: transactions, count: total } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name', 'type', 'currencyCode', 'color', 'icon'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'type', 'icon', 'color'] },
      ],
      order: [
        ['date', 'DESC'],
        ['created_at', 'DESC'],
      ],
      limit,
      offset,
    });

    // Calcular totales del set filtrado en la divisa base
    let totalIncomeInBase = 0;
    let totalExpenseInBase = 0;

    const allMatchedForSummary = await Transaction.findAll({
      where,
      attributes: ['type', 'amountInBaseCurrency'],
    });

    allMatchedForSummary.forEach(tx => {
      const amt = Number(tx.amountInBaseCurrency);
      if (tx.type === TransactionType.INCOME) totalIncomeInBase += amt;
      if (tx.type === TransactionType.EXPENSE) totalExpenseInBase += amt;
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        total,
        limit,
        offset,
        summary: {
          totalIncome: Math.round(totalIncomeInBase * 100) / 100,
          totalExpense: Math.round(totalExpenseInBase * 100) / 100,
          netBalance: Math.round((totalIncomeInBase - totalExpenseInBase) * 100) / 100,
          baseCurrencyCode: user.baseCurrencyCode,
        },
      },
    });
  } catch (error) {
    console.error('Error en GET /api/transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las transacciones.' },
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
    const validation = transactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const rates = await CurrencyService.getExchangeRates();

    // Validar cuenta origen
    const sourceAccount = await Account.findOne({
      where: { id: data.accountId, userId: user.id },
    });
    if (!sourceAccount) {
      return NextResponse.json({ success: false, error: 'Cuenta origen no encontrada.' }, { status: 404 });
    }

    const currencyCode = (data.currencyCode || sourceAccount.currencyCode).toUpperCase();
    const { convertedAmount: amountInBase, exchangeRate: rateToBase } = CurrencyService.convert(
      data.amount,
      currencyCode,
      user.baseCurrencyCode,
      rates
    );

    let budgetAlert = null;

    // Ejecutar creación dentro de transacción ACID
    const result = await sequelize.transaction(async (t) => {
      if (data.type === TransactionType.TRANSFER) {
        if (!data.destinationAccountId) {
          throw new Error('La cuenta de destino es obligatoria para una transferencia.');
        }
        if (data.destinationAccountId === data.accountId) {
          throw new Error('La cuenta de destino no puede ser igual a la cuenta de origen.');
        }

        const destAccount = await Account.findOne({
          where: { id: data.destinationAccountId, userId: user.id },
          transaction: t,
        });
        if (!destAccount) {
          throw new Error('Cuenta de destino no encontrada.');
        }

        // 1. Transacción de Egreso en cuenta origen
        const sourceTx = await Transaction.create(
          {
            userId: user.id,
            accountId: sourceAccount.id,
            categoryId: data.categoryId || null,
            amount: data.amount,
            type: TransactionType.TRANSFER,
            currencyCode,
            exchangeRateToBase: rateToBase,
            amountInBaseCurrency: amountInBase,
            date: data.date,
            description: `Transferencia a ${destAccount.name}: ${data.description}`,
            notes: data.notes,
            status: TransactionStatus.COMPLETED,
          },
          { transaction: t }
        );

        // Convertir monto a la divisa de la cuenta de destino
        const { convertedAmount: destAmount } = CurrencyService.convert(
          data.amount,
          currencyCode,
          destAccount.currencyCode,
          rates
        );

        // 2. Transacción de Ingreso en cuenta destino
        const destTx = await Transaction.create(
          {
            userId: user.id,
            accountId: destAccount.id,
            categoryId: data.categoryId || null,
            transferTransactionId: sourceTx.id,
            amount: destAmount,
            type: TransactionType.TRANSFER,
            currencyCode: destAccount.currencyCode,
            exchangeRateToBase: CurrencyService.convert(1, destAccount.currencyCode, user.baseCurrencyCode, rates).exchangeRate,
            amountInBaseCurrency: amountInBase,
            date: data.date,
            description: `Transferencia desde ${sourceAccount.name}: ${data.description}`,
            notes: data.notes,
            status: TransactionStatus.COMPLETED,
          },
          { transaction: t }
        );

        // Vincular origen a destino
        sourceTx.transferTransactionId = destTx.id;
        await sourceTx.save({ transaction: t });

        // Actualizar saldos de ambas cuentas
        sourceAccount.currentBalance = Number(sourceAccount.currentBalance) - data.amount;
        await sourceAccount.save({ transaction: t });

        destAccount.currentBalance = Number(destAccount.currentBalance) + destAmount;
        await destAccount.save({ transaction: t });

        return sourceTx;
      } else {
        // Ingreso o Egreso regular
        const tx = await Transaction.create(
          {
            userId: user.id,
            accountId: sourceAccount.id,
            categoryId: data.categoryId || null,
            amount: data.amount,
            type: data.type,
            currencyCode,
            exchangeRateToBase: rateToBase,
            amountInBaseCurrency: amountInBase,
            date: data.date,
            description: data.description,
            notes: data.notes,
            status: TransactionStatus.COMPLETED,
          },
          { transaction: t }
        );

        // Actualizar saldo de cuenta origen
        const delta = data.type === TransactionType.INCOME ? data.amount : -data.amount;
        sourceAccount.currentBalance = Number(sourceAccount.currentBalance) + delta;
        await sourceAccount.save({ transaction: t });

        return tx;
      }
    });

    // Si fue gasto y tiene categoría, evaluar alertas de presupuesto
    if (data.type === TransactionType.EXPENSE && data.categoryId) {
      budgetAlert = await evaluateBudgetForCategory(user.id, data.categoryId, data.date);
    }

    return NextResponse.json({
      success: true,
      message: 'Transacción registrada correctamente',
      data: {
        transaction: result,
        budgetAlert,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al registrar la transacción.' },
      { status: 400 }
    );
  }
}
