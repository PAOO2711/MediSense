import { NextRequest, NextResponse } from "next/server";
import {
  getPatientHistoryByDNI,
  createPatientHistory,
  updatePatientHistoryStatus,
} from "@/lib/db/queries/index";
import { ForbiddenError, requireDoctor, UnauthorizedError } from '@/lib/auth/require-user';

// GET /api/patients/[dni]/history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  try {
    await requireDoctor();
    const { dni } = await params;
    const patientDNI = dni.trim();

    if (!patientDNI) {
      return NextResponse.json(
        { error: "DNI inválido" },
        { status: 400 }
      );
    }

    // Check query param for activeOnly filter
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("activeOnly") === "true";

    const history = await getPatientHistoryByDNI(patientDNI, activeOnly);
    return NextResponse.json(history);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error("Error fetching patient history:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial del paciente" },
      { status: 500 }
    );
  }
}

// POST /api/patients/[dni]/history
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  try {
    await requireDoctor();
    const { dni } = await params;
    const patientDNI = dni.trim();

    if (!patientDNI) {
      return NextResponse.json(
        { error: "DNI inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { antecedente, resumen, diagnosticadoEn, consultationId, status } = body;

    if (!antecedente || !diagnosticadoEn || !consultationId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: antecedente, diagnosticadoEn, consultationId" },
        { status: 400 }
      );
    }

    const history = await createPatientHistory({
      patientId: patientDNI,
      antecedente,
      resumen: resumen || null,
      diagnosticadoEn: new Date(diagnosticadoEn),
      consultationId,
      status: status || 'activo',
    });

    return NextResponse.json(history, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error("Error creating patient history:", error);
    return NextResponse.json(
      { error: "Error al crear el antecedente" },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[dni]/history
export async function PUT(request: NextRequest) {
  try {
    await requireDoctor();
    const body = await request.json();
    const { historyId, status, resolvedInConsultationId } = body;

    if (!historyId || !status) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: historyId, status" },
        { status: 400 }
      );
    }

    if (status !== 'activo' && status !== 'resuelto') {
      return NextResponse.json(
        { error: "Status debe ser 'activo' o 'resuelto'" },
        { status: 400 }
      );
    }

    const updated = await updatePatientHistoryStatus(
      historyId,
      status,
      resolvedInConsultationId
    );

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error("Error updating patient history status:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado del antecedente" },
      { status: 500 }
    );
  }
}
