import { db } from '@/lib/db';
import { patients, patientHistory } from '@/lib/db/schema/index';
import { eq, desc, asc, ilike, or, and, sql, count } from 'drizzle-orm';

// Funciones para Pacientes
export async function createPatient(data: {
  dni: string;
  ownerId: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
}) {
  const [patient] = await db.insert(patients).values(data).returning();
  return patient;
}

export async function getPatients(ownerId: string) {
  return await db
    .select()
    .from(patients)
    .where(eq(patients.ownerId, ownerId))
    .orderBy(desc(patients.createdAt));
}

// Nueva función para obtener pacientes con búsqueda, ordenamiento y paginación
export async function getPatientsWithFilters({
  ownerId,
  search = '',
  sortBy = 'name',
  sortOrder = 'asc',
  page = 1,
  pageSize = 10,
}: {
  ownerId: string;
  search?: string;
  sortBy?: 'name' | 'dni' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}) {
  const offset = (page - 1) * pageSize;
  
  // Construir condición de búsqueda
  const searchCondition = search
    ? or(
        ilike(patients.name, `%${search}%`),
        sql`CAST(${patients.dni} AS TEXT) ILIKE ${`%${search}%`}`
      )
    : undefined;
  const ownerCondition = eq(patients.ownerId, ownerId);
  const whereCondition = searchCondition
    ? and(ownerCondition, searchCondition)
    : ownerCondition;

  // Construir ordenamiento
  const orderByColumn = {
    name: patients.name,
    dni: patients.dni,
    createdAt: patients.createdAt,
  }[sortBy];
  
  const orderBy = sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

  // Obtener pacientes
  const data = await db
    .select({
      dni: patients.dni,
      name: patients.name,
      email: patients.email,
    })
    .from(patients)
    .where(whereCondition)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  // Obtener total de registros
  const [{ total }] = await db
    .select({ total: count() })
    .from(patients)
    .where(whereCondition);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPatientByDNI(dni: string, ownerId: string) {
  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.dni, dni), eq(patients.ownerId, ownerId)));
  return patient;
}

// Funciones para Historial del Paciente (Antecedentes)
export async function createPatientHistory(data: {
  patientId: string;
  antecedente: string;
  resumen?: string | null;
  diagnosticadoEn: Date;
  consultationId: string;
  status?: string;
}) {
  const [history] = await db.insert(patientHistory).values(data).returning();
  return history;
}

export async function getPatientHistoryByDNI(dni: string, activeOnly: boolean = false) {
  let query = db
    .select()
    .from(patientHistory)
    .where(eq(patientHistory.patientId, dni))
    .orderBy(desc(patientHistory.diagnosticadoEn));

  if (activeOnly) {
    query = db
      .select()
      .from(patientHistory)
      .where(and(
        eq(patientHistory.patientId, dni),
        eq(patientHistory.status, 'activo')
      ))
      .orderBy(desc(patientHistory.diagnosticadoEn));
  }

  return await query;
}

export async function updatePatientHistoryStatus(
  historyId: string,
  status: 'activo' | 'resuelto',
  resolvedInConsultationId?: string
) {
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'resuelto' && resolvedInConsultationId) {
    updateData.resolvedInConsultationId = resolvedInConsultationId;
  }

  const [updated] = await db
    .update(patientHistory)
    .set(updateData)
    .where(eq(patientHistory.id, historyId))
    .returning();

  return updated;
}
