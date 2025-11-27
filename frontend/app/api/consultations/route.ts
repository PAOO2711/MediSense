import { NextRequest, NextResponse } from 'next/server';
import { createConsultation } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { consultations } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/consultations - Obtener todas las consultas
export async function GET() {
  try {
    const allConsultations = await db
      .select()
      .from(consultations)
      .orderBy(desc(consultations.date));

    return NextResponse.json(allConsultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { error: 'Error al obtener consultas' },
      { status: 500 }
    );
  }
}

// POST /api/consultations - Crear una nueva consulta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { patientId, title, description, status } = body;

    if (!patientId || !title) {
      return NextResponse.json(
        { error: 'patientId y title son requeridos' },
        { status: 400 }
      );
    }

    const consultation = await createConsultation({
      patientId: parseInt(patientId),
      title,
      description,
      status,
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { error: 'Error al crear consulta' },
      { status: 500 }
    );
  }
}
