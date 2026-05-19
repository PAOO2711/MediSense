import { NextRequest, NextResponse } from 'next/server';
import { createPatient } from '@/lib/db/queries';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ForbiddenError,
  requireAdmin,
  UnauthorizedError,
} from '@/lib/auth/require-user';

// POST /api/admin/patients Crear un nuevo paciente
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { dni, ownerId, name, email, phone, dateOfBirth } = body;

    if (!dni || !name || !ownerId) {
      return NextResponse.json(
        { error: 'DNI, nombre y médico asignado son obligatorios' },
        { status: 400 }
      );
    }

    const normalizedDni = String(dni).trim();
    if (!normalizedDni) {
      return NextResponse.json(
        { error: 'El DNI es obligatorio' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: doctorRole, error: doctorRoleError } = await supabase
      .from('roles')
      .select('id')
      .eq('id', ownerId)
      .eq('role', 'user')
      .maybeSingle();

    if (doctorRoleError) {
      return NextResponse.json({ error: doctorRoleError.message }, { status: 400 });
    }

    if (!doctorRole) {
      return NextResponse.json(
        { error: 'El médico seleccionado no es válido' },
        { status: 400 }
      );
    }

    const patient = await createPatient({
      dni: normalizedDni,
      ownerId,
      name: String(name).trim(),
      email: email ? String(email).trim() : undefined,
      phone: phone ? String(phone).trim() : undefined,
      dateOfBirth: dateOfBirth ? new Date(String(dateOfBirth)) : undefined,
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('Error creating admin patient:', error);
    return NextResponse.json(
      { error: 'Error inesperado al crear paciente' },
      { status: 500 }
    );
  }
}