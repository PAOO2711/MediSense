import { NextRequest, NextResponse } from 'next/server';
import { getConsultationWithDetails } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { consultations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ForbiddenError, requireDoctor, UnauthorizedError } from '@/lib/auth/require-user';

// GET /api/consultations/[id] - Obtener una consulta con todos sus detalles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireDoctor();
    const { id } = await params;
    const consultation = await getConsultationWithDetails(id);

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(consultation);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error fetching consultation:', error);
    return NextResponse.json(
      { error: 'Error al obtener consulta' },
      { status: 500 }
    );
  }
}

// PUT /api/consultations/[id] - Actualizar una consulta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireDoctor();
    const { id } = await params;
    const body = await request.json();
    
    const { title, motivoConsulta, anamnesis, pruebas, recomendaciones, status } = body;

    const [updated] = await db
      .update(consultations)
      .set({
        title,
        motivoConsulta,
        anamnesis,
        pruebas,
        recomendaciones,
        status,
        updatedAt: new Date(),
      })
      .where(eq(consultations.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error updating consultation:', error);
    return NextResponse.json(
      { error: 'Error al actualizar consulta' },
      { status: 500 }
    );
  }
}

// DELETE /api/consultations/[id] - Eliminar una consulta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireDoctor();
    const { id } = await params;
    
    const [deleted] = await db
      .delete(consultations)
      .where(eq(consultations.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Consulta eliminada correctamente' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error deleting consultation:', error);
    return NextResponse.json(
      { error: 'Error al eliminar consulta' },
      { status: 500 }
    );
  }
}
