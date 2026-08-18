import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Account, AccountType } from '../../../database/models';
import { getAuthenticatedUser } from '../../../lib/auth';
import { CurrencyService } from '../../../lib/currency';
import { ensureDatabaseReady } from '../../../lib/db';

const accountSchema = z.object({
  name: z.string().min(2, 'El nombre de la cuenta es obligatorio'),
  type: z.nativeEnum(AccountType),
  currencyCode: z.string().length(3).default('USD'),
  initialBalance: z.number().default(0),
  color: z.string().default('#3B82F6'),
  icon: z.string().default('wallet'),
  isIncludedInNetWorth: z.boolean().default(true),
});

export async function GET() {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const accounts = await Account.findAll({
      where: { userId: user.id },
      order: [['created_at', 'ASC']],
    });

    const rates = await CurrencyService.getExchangeRates();
    let totalNetWorthInBase = 0;

    const formattedAccounts = accounts.map(acc => {
      const balance = Number(acc.currentBalance);
      const { convertedAmount } = CurrencyService.convert(
        balance,
        acc.currencyCode,
        user.baseCurrencyCode,
        rates
      );

      if (acc.isIncludedInNetWorth) {
        // En tarjetas de crédito, si el saldo es positivo representa deuda a menos que se defina lo contrario
        totalNetWorthInBase += convertedAmount;
      }

      return {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        currencyCode: acc.currencyCode,
        currentBalance: balance,
        initialBalance: Number(acc.initialBalance),
        balanceInBaseCurrency: convertedAmount,
        color: acc.color,
        icon: acc.icon,
        isIncludedInNetWorth: acc.isIncludedInNetWorth,
        createdAt: acc.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        accounts: formattedAccounts,
        baseCurrencyCode: user.baseCurrencyCode,
        totalNetWorth: Math.round(totalNetWorthInBase * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las cuentas.' },
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
    const validation = accountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const account = await Account.create({
      userId: user.id,
      name: data.name,
      type: data.type,
      currencyCode: data.currencyCode.toUpperCase(),
      initialBalance: data.initialBalance,
      currentBalance: data.initialBalance,
      color: data.color,
      icon: data.icon,
      isIncludedInNetWorth: data.isIncludedInNetWorth,
    });

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente',
      data: { account },
    }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear la cuenta.' },
      { status: 500 }
    );
  }
}
