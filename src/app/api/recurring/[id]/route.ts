import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RecurringTransaction } from '../../../../database/models';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { ensureDatabaseReady } from '../../../../lib/db';

const updateRecurringSchema = z.object({
  isActive: z.boolean().optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(2).optional(),
  endDate: z.string().optional().nullable(),
});

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const params = await props.params;
    const item = await RecurringTransaction.findOne({
      where: { id: params.id, userId: user.id },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Transacción recurrente no encontrada.' }, { status: 404 });
    }

    const body = await req.json();
    const validation = updateRecurringSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await item.update(validation.data);

    return NextResponse.json({
      success: true,
      message: 'Transacción recurrente actualizada',
      data: { recurring: item },
    });
  } catch (error) {
    console.error('Error en PUT /api/recurring/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar transacción recurrente.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const params = await props.params;
    const item = await RecurringTransaction.findOne({
      where: { id: params.id, userId: user.id },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Transacción recurrente no encontrada.' }, { status: 404 });
    }

    await item.destroy();

    return NextResponse.json({
      success: true,
      message: 'Transacción recurrente eliminada',
    });
  } catch (error) {
    console.error('Error en DELETE /api/recurring/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar transacción recurrente.' },
      { status: 500 }
    );
  }
}
