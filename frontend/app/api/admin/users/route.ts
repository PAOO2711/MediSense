import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ForbiddenError,
  requireAdmin,
  UnauthorizedError,
} from '@/lib/auth/require-user';

// GET /api/admin/users Obtener una lista de usuarios con paginación y búsqueda
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { dni, name, surname, email, phone, dateOfBirth, password } = await request.json();

    const normalizedDni = typeof dni === 'string' ? dni.trim().toUpperCase() : '';
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedSurname = typeof surname === 'string' ? surname.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPhone = typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : null;
    const normalizedDateOfBirth =
      typeof dateOfBirth === 'string' && dateOfBirth.trim().length > 0
        ? dateOfBirth.trim()
        : null;

    if (!normalizedDni || !normalizedName || !normalizedSurname || !normalizedEmail || !password) {
      return NextResponse.json(
        { error: 'DNI, nombre, apellidos, email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    if (normalizedDateOfBirth && Number.isNaN(Date.parse(normalizedDateOfBirth))) {
      return NextResponse.json(
        { error: 'La fecha de nacimiento no es válida' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
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

    const { error: doctorError } = await supabase.from('doctors').insert({
      dni: normalizedDni,
      id: data.user.id,
      name: normalizedName,
      surname: normalizedSurname,
      email: normalizedEmail,
      phone: normalizedPhone,
      date_of_birth: normalizedDateOfBirth,
    });

    if (doctorError) {
      await supabase.from('roles').delete().eq('id', data.user.id);
      await supabase.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: doctorError.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        id: data.user?.id,
        name: normalizedName,
        surname: normalizedSurname,
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
