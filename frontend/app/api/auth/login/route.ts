import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/auth/login
// Útil para Bruno y herramientas de testing: devuelve el access_token de Supabase
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message === 'Invalid login credentials'
            ? 'Credenciales inválidas'
            : error.message
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      access_token: data.session?.access_token,
      token_type: 'bearer',
      expires_in: data.session?.expires_in,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}
