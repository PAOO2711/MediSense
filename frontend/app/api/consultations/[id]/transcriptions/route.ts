import { NextRequest, NextResponse } from 'next/server';
import { getTranscriptionsByConsultation } from '@/lib/db/queries';

// GET /api/consultations/[id]/transcriptions - Obtener transcripciones de una consulta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transcriptions = await getTranscriptionsByConsultation(id);

    return NextResponse.json(transcriptions);
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    return NextResponse.json(
      { error: 'Error al obtener transcripciones' },
      { status: 500 }
    );
  }
}
