import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Account, AccountType, Transaction } from '../../../../database/models';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { ensureDatabaseReady } from '../../../../lib/db';

const updateAccountSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.nativeEnum(AccountType).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isIncludedInNetWorth: z.boolean().optional(),
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
    const account = await Account.findOne({
      where: { id: params.id, userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 404 });
    }

    const body = await req.json();
    const validation = updateAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await account.update(validation.data);

    return NextResponse.json({
      success: true,
      message: 'Cuenta actualizada exitosamente',
      data: { account },
    });
  } catch (error) {
    console.error('Error en PUT /api/accounts/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la cuenta.' },
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
    const account = await Account.findOne({
      where: { id: params.id, userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 404 });
    }

    // Comprobar si hay transacciones asociadas
    const countTx = await Transaction.count({ where: { accountId: account.id } });
    if (countTx > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una cuenta con transacciones registradas. Puedes archivarla o eliminar primero sus transacciones.' },
        { status: 400 }
      );
    }

    await account.destroy();

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/accounts/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la cuenta.' },
      { status: 500 }
    );
  }
}
