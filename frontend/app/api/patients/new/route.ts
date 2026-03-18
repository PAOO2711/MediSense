import { NextRequest, NextResponse } from 'next/server';
import { createPatient } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';

// POST /api/patients - Crear un nuevo paciente
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dni, name, email, dateOfBirth, phone } = body;

    if (!dni || !name) {
      return NextResponse.json(
        { error: 'DNI y nombre son requeridos' },
        { status: 400 }
      );
    }

    const phoneTrimmed = phone ? phone.trim() : undefined;
    const emailTrimmed = email ? email.trim() : undefined;

    const patient = await createPatient({
      dni: parseInt(dni, 10),
      ownerId: user.id,
      name,
      email: emailTrimmed,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      phone: phoneTrimmed,
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Error al crear paciente' }, { status: 500 });
  }
}