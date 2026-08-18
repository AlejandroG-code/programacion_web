import { NextResponse } from 'next/server';
import { sequelize } from '../../../../config/database';
import { Transaction, Account, TransactionType } from '../../../../database/models';
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
    const tx = await Transaction.findOne({
      where: { id: params.id, userId: user.id },
    });

    if (!tx) {
      return NextResponse.json({ success: false, error: 'Transacción no encontrada.' }, { status: 404 });
    }

    await sequelize.transaction(async (t) => {
      const account = await Account.findByPk(tx.accountId, { transaction: t });

      if (tx.type === TransactionType.TRANSFER && tx.transferTransactionId) {
        // Revertir par de transferencia
        const pairTx = await Transaction.findOne({
          where: { id: tx.transferTransactionId, userId: user.id },
          transaction: t,
        });

        if (account) {
          account.currentBalance = Number(account.currentBalance) + Number(tx.amount);
          await account.save({ transaction: t });
        }

        if (pairTx) {
          const pairAccount = await Account.findByPk(pairTx.accountId, { transaction: t });
          if (pairAccount) {
            pairAccount.currentBalance = Number(pairAccount.currentBalance) - Number(pairTx.amount);
            await pairAccount.save({ transaction: t });
          }
          await pairTx.destroy({ transaction: t });
        }
      } else if (account) {
        // Revertir ingreso o gasto regular
        const delta = tx.type === TransactionType.INCOME ? -Number(tx.amount) : Number(tx.amount);
        account.currentBalance = Number(account.currentBalance) + delta;
        await account.save({ transaction: t });
      }

      await tx.destroy({ transaction: t });
    });

    return NextResponse.json({
      success: true,
      message: 'Transacción eliminada y saldo restituido correctamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/transactions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la transacción.' },
      { status: 500 }
    );
  }
}
