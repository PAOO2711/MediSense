import { NextRequest, NextResponse } from 'next/server';
import { getConsultationsByPatient } from '@/lib/db/queries';

// GET /api/patients/[dni]/consultations - Obtener consultas de un paciente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  try {
    const { dni } = await params;
    const consultations = await getConsultationsByPatient(parseInt(dni));

    return NextResponse.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { error: 'Error al obtener consultas' },
      { status: 500 }
    );
  }
}
