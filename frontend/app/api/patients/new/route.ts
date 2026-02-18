import { NextRequest, NextResponse } from 'next/server';
import { createPatient } from '@/lib/db/queries';

// POST /api/patients - Crear un nuevo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { dni, name, email, dateOfBirth, phone } = body;

    if (!dni || !name) {
      return NextResponse.json(
        { error: 'DNI y nombre son requeridos' },
        { status: 400 }
      );
    }

    const patient = await createPatient({
      dni: parseInt(dni),
      name,
      email,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      phone,
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Error al crear paciente' },
      { status: 500 }
    );
  }
}