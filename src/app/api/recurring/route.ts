import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RecurringTransaction, RecurrenceFrequency, Account, Category } from '../../../database/models';
import { getAuthenticatedUser } from '../../../lib/auth';
import { ensureDatabaseReady } from '../../../lib/db';

const recurringSchema = z.object({
  accountId: z.string().uuid('ID de cuenta no válido'),
  categoryId: z.string().uuid('ID de categoría no válido'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  currencyCode: z.string().length(3).optional(),
  frequency: z.nativeEnum(RecurrenceFrequency),
  intervalCount: z.number().int().min(1).default(1),
  startDate: z.string().min(10),
  endDate: z.string().optional().nullable(),
  description: z.string().min(2, 'La descripción es obligatoria'),
  autoConfirm: z.boolean().default(true),
});

export async function GET() {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const items = await RecurringTransaction.findAll({
      where: { userId: user.id },
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name', 'type', 'currencyCode', 'color', 'icon'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] },
      ],
      order: [['next_execution_date', 'ASC']],
    });

    return NextResponse.json({
      success: true,
      data: { recurringTransactions: items },
    });
  } catch (error) {
    console.error('Error en GET /api/recurring:', error);
    return NextResponse.json(
      { success: false, error: 'Error al consultar transacciones recurrentes.' },
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
    const validation = recurringSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const account = await Account.findOne({ where: { id: data.accountId, userId: user.id } });
    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 404 });
    }

    const currencyCode = (data.currencyCode || account.currencyCode).toUpperCase();

    const recurring = await RecurringTransaction.create({
      userId: user.id,
      accountId: data.accountId,
      categoryId: data.categoryId,
      amount: data.amount,
      type: data.type,
      currencyCode,
      frequency: data.frequency,
      intervalCount: data.intervalCount,
      startDate: data.startDate,
      endDate: data.endDate || null,
      nextExecutionDate: data.startDate,
      description: data.description,
      isActive: true,
      autoConfirm: data.autoConfirm,
    });

    return NextResponse.json({
      success: true,
      message: 'Regla de transacción recurrente creada exitosamente',
      data: { recurring },
    }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/recurring:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear transacción recurrente.' },
      { status: 500 }
    );
  }
}
