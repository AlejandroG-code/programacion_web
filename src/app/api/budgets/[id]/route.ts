import { NextResponse } from 'next/server';
import { Budget } from '../../../../database/models';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { ensureDatabaseReady } from '../../../../lib/db';

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
    const budget = await Budget.findOne({
      where: { id: params.id, userId: user.id },
    });

    if (!budget) {
      return NextResponse.json({ success: false, error: 'Presupuesto no encontrado.' }, { status: 404 });
    }

    await budget.destroy();

    return NextResponse.json({
      success: true,
      message: 'Presupuesto eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/budgets/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar presupuesto.' },
      { status: 500 }
    );
  }
}
