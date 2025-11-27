import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiDiagnoses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/diagnoses/[id] - Obtener un diagnóstico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [diagnosis] = await db
      .select()
      .from(aiDiagnoses)
      .where(eq(aiDiagnoses.id, id));

    if (!diagnosis) {
      return NextResponse.json(
        { error: 'Diagnóstico no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    return NextResponse.json(
      { error: 'Error al obtener diagnóstico' },
      { status: 500 }
    );
  }
}

// DELETE /api/diagnoses/[id] - Eliminar un diagnóstico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [deleted] = await db
      .delete(aiDiagnoses)
      .where(eq(aiDiagnoses.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Diagnóstico no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Diagnóstico eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting diagnosis:', error);
    return NextResponse.json(
      { error: 'Error al eliminar diagnóstico' },
      { status: 500 }
    );
  }
}
