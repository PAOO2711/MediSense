import { NextRequest, NextResponse } from 'next/server';
import { createTranscription, getTranscriptionsByConsultation } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { transcriptions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { ForbiddenError, requireDoctor, UnauthorizedError } from '@/lib/auth/require-user';

// GET /api/transcriptions - Obtener todas las transcripciones
export async function GET() {
  try {
    await requireDoctor();
    const allTranscriptions = await db
      .select()
      .from(transcriptions)
      .orderBy(desc(transcriptions.createdAt));

    return NextResponse.json(allTranscriptions);
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

// POST /api/transcriptions - Crear una nueva transcripción
export async function POST(request: NextRequest) {
  try {
    await requireDoctor();
    const body = await request.json();
    
    const { consultationId, fullText, segments, duration, language, languageProbability, filename } = body;

    if (!consultationId || !fullText) {
      return NextResponse.json(
        { error: 'consultationId y fullText son requeridos' },
        { status: 400 }
      );
    }

    const transcription = await createTranscription({
      consultationId,
      fullText,
      segments,
      duration,
      language,
      languageProbability,
      filename,
    });

    return NextResponse.json(transcription, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error creating transcription:', error);
    return NextResponse.json(
      { error: 'Error al crear transcripción' },
      { status: 500 }
    );
  }
}
