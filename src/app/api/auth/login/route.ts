import { NextResponse } from 'next/server';
import { z } from 'zod';
import { User } from '../../../../database/models';
import { comparePassword, generateToken, AUTH_COOKIE_OPTIONS } from '../../../../lib/auth';
import { ensureDatabaseReady } from '../../../../lib/db';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
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

    response.cookies.set(
      AUTH_COOKIE_OPTIONS.name,
      token,
      AUTH_COOKIE_OPTIONS.options
    );

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al iniciar sesión.' },
      { status: 500 }
    );
  }
}
