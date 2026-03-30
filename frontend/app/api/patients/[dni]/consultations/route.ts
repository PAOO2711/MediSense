import { NextRequest, NextResponse } from 'next/server';
import { getConsultationsByPatient } from '@/lib/db/queries';
import { ForbiddenError, requireDoctor, UnauthorizedError } from '@/lib/auth/require-user';

// GET /api/patients/[dni]/consultations - Obtener consultas de un paciente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  try {
    await requireDoctor();
    const { dni } = await params;
    const consultations = await getConsultationsByPatient(parseInt(dni));

    return NextResponse.json(consultations);
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
