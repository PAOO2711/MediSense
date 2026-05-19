import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ForbiddenError,
  requireAdmin,
  UnauthorizedError,
} from '@/lib/auth/require-user';

type DoctorResult = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 25;

// GET /api/admin/doctors Obtener una lista de médicos con paginación y búsqueda
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const search = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? '';
    const pageParam = Number.parseInt(request.nextUrl.searchParams.get('page') ?? '', 10);
    const limitParam = Number.parseInt(request.nextUrl.searchParams.get('limit') ?? '', 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : DEFAULT_PAGE;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createAdminClient();

    let query = supabase
      .from('doctors')
      .select('id, name, surname, email', { count: 'exact' })
      .order('name', { ascending: true })
      .order('surname', { ascending: true })
      .range(from, to);

    if (search.length > 0) {
      query = query.or(
        `name.ilike.%${search}%,surname.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data: doctorProfiles, error: doctorsError, count } = await query;

    if (doctorsError) {
      return NextResponse.json({ error: doctorsError.message }, { status: 400 });
    }

    const doctors: DoctorResult[] = (doctorProfiles ?? [])
      .map((doctor) => {
        const name = typeof doctor.name === 'string' ? doctor.name.trim() : '';
        const surname = typeof doctor.surname === 'string' ? doctor.surname.trim() : '';
        const email = typeof doctor.email === 'string' ? doctor.email.trim() : '';

        return {
          id: doctor.id,
          name,
          surname,
          email,
        };
      })
      .filter((doctor) => {
        if (search.length === 0) {
          return true;
        }

        const fullName = `${doctor.name} ${doctor.surname}`.trim().toLowerCase();
        return (
          fullName.includes(search) ||
          doctor.name.toLowerCase().includes(search) ||
          doctor.surname.toLowerCase().includes(search) ||
          doctor.email.toLowerCase().includes(search) ||
          doctor.id.toLowerCase().includes(search)
        );
      });

    const total = count ?? doctors.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return NextResponse.json({
      data: doctors,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
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

    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Error inesperado al obtener médicos' },
      { status: 500 }
    );
  }
}