import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ForbiddenError,
  requireAdmin,
  UnauthorizedError,
} from '@/lib/auth/require-user';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user?.id) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 400 });
    }

    const { error: roleError } = await supabase.from('roles').insert({
      id: data.user.id,
      role: 'user',
    });

    if (roleError) {
      // Intentar rollback del usuario de auth si falla el insert del rol
      await supabase.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: roleError.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        id: data.user?.id,
        email: data.user?.email,
        role: 'user',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('Error creating doctor user:', error);
    return NextResponse.json(
      { error: 'Error inesperado al crear usuario' },
      { status: 500 }
    );
  }
}
