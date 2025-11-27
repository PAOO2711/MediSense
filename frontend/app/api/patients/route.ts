import { NextRequest, NextResponse } from 'next/server';
import { getPatients, getPatientsWithFilters, createPatient } from '@/lib/db/queries';

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

// POST /api/patients - Crear un nuevo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { dni, name, email, phone, dateOfBirth } = body;

    if (!dni || !name) {
      return NextResponse.json(
        { error: 'DNI y nombre son requeridos' },
        { status: 400 }
      );
    }

    const patient = await createPatient({
      dni: parseInt(dni),
      name,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Error al crear paciente' },
      { status: 500 }
    );
  }
}
