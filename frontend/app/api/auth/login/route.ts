import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/auth/login
// Útil para Bruno y herramientas de testing: inicia sesión y devuelve cookie de sesión
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const response = await auth.api.signInEmail({
      headers: request.headers,
      body: {
        email,
        password,
      },
      asResponse: true,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const result = NextResponse.json({ success: true, message: 'Login correcto' });
    const setCookie = response.headers.get('set-cookie');

    if (setCookie) {
      result.headers.set('set-cookie', setCookie);
    }

    return result;
  } catch {
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}
