import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transcriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/transcriptions/[id] - Obtener una transcripción por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [transcription] = await db
      .select()
      .from(transcriptions)
      .where(eq(transcriptions.id, id));

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcripción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(transcription);
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return NextResponse.json(
      { error: 'Error al obtener transcripción' },
      { status: 500 }
    );
  }
}

// DELETE /api/transcriptions/[id] - Eliminar una transcripción
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [deleted] = await db
      .delete(transcriptions)
      .where(eq(transcriptions.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Transcripción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Transcripción eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting transcription:', error);
    return NextResponse.json(
      { error: 'Error al eliminar transcripción' },
      { status: 500 }
    );
  }
}
