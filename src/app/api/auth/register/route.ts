import { NextResponse } from 'next/server';
import { z } from 'zod';
import { User, Account, AccountType } from '../../../../database/models';
import { hashPassword, generateToken, AUTH_COOKIE_OPTIONS } from '../../../../lib/auth';
import { ensureDatabaseReady } from '../../../../lib/db';

const registerSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  baseCurrencyCode: z.string().length(3).default('USD'),
});

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, baseCurrencyCode } = validation.data;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico ya se encuentra registrado.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      firstName,
      lastName,
      baseCurrencyCode: baseCurrencyCode.toUpperCase(),
      isActive: true,
    });

    // Crear cuentas predeterminadas para el nuevo usuario
    await Account.create({
      userId: user.id,
      name: 'Efectivo Principal',
      type: AccountType.CASH,
      currencyCode: user.baseCurrencyCode,
      currentBalance: 0,
      initialBalance: 0,
      color: '#10B981',
      icon: 'banknote',
    });

    await Account.create({
      userId: user.id,
      name: 'Cuenta Débito / Nómina',
      type: AccountType.DEBIT,
      currencyCode: user.baseCurrencyCode,
      currentBalance: 0,
      initialBalance: 0,
      color: '#3B82F6',
      icon: 'credit-card',
    });

    const token = generateToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            baseCurrencyCode: user.baseCurrencyCode,
          },
        },
      },
      { status: 201 }
    );

    response.cookies.set(
      AUTH_COOKIE_OPTIONS.name,
      token,
      AUTH_COOKIE_OPTIONS.options
    );

    return response;
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al procesar el registro.' },
      { status: 500 }
    );
  }
}
