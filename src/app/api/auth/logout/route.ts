import { NextResponse } from 'next/server';
import { AUTH_COOKIE_OPTIONS } from '../../../../lib/auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesión cerrada exitosamente',
  });

  response.cookies.set(AUTH_COOKIE_OPTIONS.name, '', {
    ...AUTH_COOKIE_OPTIONS.options,
    maxAge: 0,
  });

  return response;
}
