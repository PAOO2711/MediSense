import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ForbiddenError,
  requireAdmin,
  UnauthorizedError,
} from '@/lib/auth/require-user';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 25;

type PatientResult = {
  dni: string;
  name: string;
  email: string | null;
  ownerId: string;
};

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const search = request.nextUrl.searchParams.get('search')?.trim().toLowerCase() ?? '';
    const pageParam = Number.parseInt(request.nextUrl.searchParams.get('page') ?? '', 10);
    const pageSizeParam = Number.parseInt(request.nextUrl.searchParams.get('pageSize') ?? '', 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : DEFAULT_PAGE;
    const pageSize =
      Number.isFinite(pageSizeParam) && pageSizeParam > 0
        ? Math.min(pageSizeParam, MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('patients')
      .select('dni,name,email,owner_id')
      .order('name', { ascending: true })
      .order('dni', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const filteredPatients = (data ?? []).filter((patient) => {
      if (search.length === 0) {
        return true;
      }

      const searchValue = search.toLowerCase();
      const dniValue = String(patient.dni).toLowerCase();
      return (
        patient.name.toLowerCase().includes(searchValue) ||
        (patient.email?.toLowerCase().includes(searchValue) ?? false) ||
        dniValue.includes(searchValue)
      );
    });

    const totalCount = filteredPatients.length;
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const pagePatients = filteredPatients.slice(from, to);

    return NextResponse.json({
      data: pagePatients.map((patient): PatientResult => ({
        dni: patient.dni,
        name: patient.name,
        email: patient.email,
        ownerId: patient.owner_id,
      })),
      meta: {
        page,
        pageSize,
        total: totalCount,
        totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize),
        hasNextPage: from + pageSize < totalCount,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error fetching admin patient assignments:', error);
    return NextResponse.json(
      { error: 'Error inesperado al obtener pacientes' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { dni, ownerId } = body;

    if (!dni || !ownerId) {
      return NextResponse.json(
        { error: 'DNI y médico asignado son obligatorios' },
        { status: 400 }
      );
    }

    const normalizedDni = String(dni).trim();
    if (!normalizedDni) {
      return NextResponse.json({ error: 'El DNI es obligatorio' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', String(ownerId))
      .maybeSingle();

    if (doctorError) {
      return NextResponse.json({ error: doctorError.message }, { status: 400 });
    }

    if (!doctor) {
      return NextResponse.json({ error: 'El médico seleccionado no es válido' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('patients')
      .update({
        owner_id: String(ownerId),
        updated_at: new Date().toISOString(),
      })
      .eq('dni', normalizedDni)
      .select('dni,name,owner_id')
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      dni: updated.dni,
      name: updated.name,
      ownerId: updated.owner_id,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error assigning doctor to patient:', error);
    return NextResponse.json(
      { error: 'Error inesperado al reasignar paciente' },
      { status: 500 }
    );
  }
}
