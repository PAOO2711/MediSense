import { NextRequest, NextResponse } from 'next/server';
import { createAiDiagnosis } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { aiDiagnoses } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/diagnoses - Obtener todos los diagnósticos
export async function GET() {
  try {
    const allDiagnoses = await db
      .select()
      .from(aiDiagnoses)
      .orderBy(desc(aiDiagnoses.createdAt));

    return NextResponse.json(allDiagnoses);
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    return NextResponse.json(
      { error: 'Error al obtener diagnósticos' },
      { status: 500 }
    );
  }
}

// POST /api/diagnoses - Crear un nuevo diagnóstico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { consultationId, transcriptionId, diagnosis, confidence, recommendations, modelUsed } = body;

    if (!consultationId || !transcriptionId || !diagnosis) {
      return NextResponse.json(
        { error: 'consultationId, transcriptionId y diagnosis son requeridos' },
        { status: 400 }
      );
    }

    const aiDiagnosis = await createAiDiagnosis({
      consultationId,
      transcriptionId,
      diagnosis,
      confidence,
      recommendations,
      modelUsed,
    });

    return NextResponse.json(aiDiagnosis, { status: 201 });
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    return NextResponse.json(
      { error: 'Error al crear diagnóstico' },
      { status: 500 }
    );
  }
}
