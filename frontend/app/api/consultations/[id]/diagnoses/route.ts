import { NextRequest, NextResponse } from 'next/server';
import { getLatestDiagnosisByConsultation } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { aiDiagnoses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ForbiddenError, requireDoctor, UnauthorizedError } from '@/lib/auth/require-user';

// GET /api/consultations/[id]/diagnoses - Obtener diagnósticos de una consulta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireDoctor();
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const latest = searchParams.get('latest') === 'true';

    if (latest) {
      const diagnosis = await getLatestDiagnosisByConsultation(id);
      return NextResponse.json(diagnosis || null);
    }

    const diagnoses = await db
      .select()
      .from(aiDiagnoses)
      .where(eq(aiDiagnoses.consultationId, id))
      .orderBy(desc(aiDiagnoses.createdAt));

    return NextResponse.json(diagnoses);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error fetching diagnoses:', error);
    return NextResponse.json(
      { error: 'Error al obtener diagnósticos' },
      { status: 500 }
    );
  }
}
