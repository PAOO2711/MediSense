import { NextRequest, NextResponse } from 'next/server';
import { createConsultation } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { consultations } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { ForbiddenError, requireDoctor, UnauthorizedError } from '@/lib/auth/require-user';

// GET /api/consultations - Obtener todas las consultas
export async function GET() {
  try {
    await requireDoctor();
    const allConsultations = await db
      .select()
      .from(consultations)
      .orderBy(desc(consultations.date));

    return NextResponse.json(allConsultations);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
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
    await requireDoctor();
    const body = await request.json();
    
    const { patientId, title, motivoConsulta, anamnesis, pruebas, diagnostico, recomendaciones, status } = body;

    if (!patientId || !title) {
      return NextResponse.json(
        { error: 'patientId y title son requeridos' },
        { status: 400 }
      );
    }

    const normalizedPatientId = String(patientId).trim();
    if (!normalizedPatientId) {
      return NextResponse.json(
        { error: 'patientId y title son requeridos' },
        { status: 400 }
      );
    }

    const consultation = await createConsultation({
      patientId: normalizedPatientId,
      title,
      motivoConsulta,
      anamnesis,
      pruebas,
      diagnostico,
      recomendaciones,
      status,
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { error: 'Error al crear consulta' },
      { status: 500 }
    );
  }
}
