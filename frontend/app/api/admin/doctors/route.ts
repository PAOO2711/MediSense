import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ForbiddenError,
  requireAdmin,
  UnauthorizedError,
} from '@/lib/auth/require-user';

type DoctorResult = {
  id: string;
  email: string;
};

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const search = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? '';
    const supabase = createAdminClient();

    const { data: doctorRoles, error: rolesError } = await supabase
      .from('roles')
      .select('id')
      .eq('role', 'user');

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 400 });
    }

    const doctorIds = new Set((doctorRoles ?? []).map((row) => row.id));
    if (doctorIds.size === 0) {
      return NextResponse.json({ data: [] satisfies DoctorResult[] });
    }

    const doctors: DoctorResult[] = [];
    const perPage = 100;
    let page = 1;

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const users = data.users ?? [];
      if (users.length === 0) {
        break;
      }

      for (const user of users) {
        if (!doctorIds.has(user.id)) {
          continue;
        }

        const email = user.email?.trim();
        if (!email) {
          continue;
        }

        const matchSearch =
          search.length === 0 ||
          email.toLowerCase().includes(search) ||
          user.id.toLowerCase().includes(search);

        if (matchSearch) {
          doctors.push({
            id: user.id,
            email,
          });
        }
      }

      const lastPage = data.lastPage ?? page;
      if (page >= lastPage || doctors.length >= 60) {
        break;
      }
      page += 1;
    }

    doctors.sort((a, b) => a.email.localeCompare(b.email));

    return NextResponse.json({
      data: doctors.slice(0, 60),
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