import { NextRequest, NextResponse } from 'next/server';
import { getPatientByDNI } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/patients/[dni] - Obtener un paciente por DNI
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  try {
    const { dni } = await params;
    const patient = await getPatientByDNI(parseInt(dni));

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Error al obtener paciente' },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[dni] - Actualizar un paciente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  try {
    const { dni } = await params;
    const body = await request.json();
    
    const { name, email, phone, dateOfBirth } = body;

    const [updated] = await db
      .update(patients)
      .set({
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(patients.dni, parseInt(dni)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Error al actualizar paciente' },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[dni] - Eliminar un paciente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  try {
    const { dni } = await params;
    
    const [deleted] = await db
      .delete(patients)
      .where(eq(patients.dni, parseInt(dni)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Error al eliminar paciente' },
      { status: 500 }
    );
  }
}
