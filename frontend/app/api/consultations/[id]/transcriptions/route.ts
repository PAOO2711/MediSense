import { NextRequest, NextResponse } from 'next/server';
import { getTranscriptionsByConsultation } from '@/lib/db/queries';
import { ForbiddenError, requireDoctor, UnauthorizedError } from '@/lib/auth/require-user';

// GET /api/consultations/[id]/transcriptions - Obtener transcripciones de una consulta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireDoctor();
    const { id } = await params;
    const transcriptions = await getTranscriptionsByConsultation(id);

    return NextResponse.json(transcriptions);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error fetching transcriptions:', error);
    return NextResponse.json(
      { error: 'Error al obtener transcripciones' },
      { status: 500 }
    );
  }
}
