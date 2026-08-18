import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { ensureDatabaseReady } from '../../../../lib/db';

export async function GET() {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          baseCurrencyCode: user.baseCurrencyCode,
        },
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo datos del usuario.' },
      { status: 500 }
    );
  }
}
