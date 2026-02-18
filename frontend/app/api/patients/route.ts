import { NextRequest, NextResponse } from 'next/server';
import { getPatients, getPatientsWithFilters } from '@/lib/db/queries';

// GET /api/patients - Obtener todos los pacientes con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const search = searchParams.get('search') || '';
    const sortBy = (searchParams.get('sortBy') as 'name' | 'dni' | 'createdAt') || 'name';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Si no hay parámetros, devolver todos sin paginación
    if (!search && !searchParams.has('page')) {
      const patients = await getPatients();
      return NextResponse.json({ data: patients, total: patients.length });
    }

    const result = await getPatientsWithFilters({
      search,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Error al obtener pacientes' },
      { status: 500 }
    );
  }
}