import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Currency, User, Transaction } from '../../../database/models';
import { getAuthenticatedUser } from '../../../lib/auth';
import { CurrencyService } from '../../../lib/currency';
import { ensureDatabaseReady } from '../../../lib/db';

const updateCurrencySchema = z.object({
  baseCurrencyCode: z.string().length(3),
});

export async function GET() {
  try {
    await ensureDatabaseReady();
    const currencies = await Currency.findAll({ order: [['code', 'ASC']] });
    const user = await getAuthenticatedUser();

    return NextResponse.json({
      success: true,
      data: {
        currencies,
        userBaseCurrency: user ? user.baseCurrencyCode : 'USD',
      },
    });
  } catch (error) {
    console.error('Error en GET /api/currencies:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener divisas.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateCurrencySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const newCode = validation.data.baseCurrencyCode.toUpperCase();
    const exists = await Currency.findByPk(newCode);
    if (!exists) {
      return NextResponse.json({ success: false, error: 'Divisa no válida.' }, { status: 400 });
    }

    user.baseCurrencyCode = newCode;
    await user.save();

    // Recalcular montos normalizados de transacciones históricas en la nueva divisa base
    const rates = await CurrencyService.getExchangeRates();
    const userTransactions = await Transaction.findAll({ where: { userId: user.id } });

    for (const tx of userTransactions) {
      const { convertedAmount, exchangeRate } = CurrencyService.convert(
        tx.amount,
        tx.currencyCode,
        newCode,
        rates
      );
      tx.amountInBaseCurrency = convertedAmount;
      tx.exchangeRateToBase = exchangeRate;
      await tx.save();
    }

    return NextResponse.json({
      success: true,
      message: `Divisa base actualizada a ${newCode} y balances normalizados.`,
      data: { baseCurrencyCode: newCode },
    });
  } catch (error) {
    console.error('Error en PUT /api/currencies:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar divisa base.' },
      { status: 500 }
    );
  }
}
