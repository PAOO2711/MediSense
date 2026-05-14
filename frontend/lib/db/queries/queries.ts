import { db } from '@/lib/db';
import { patients, consultations, transcriptions, aiDiagnoses, patientHistory } from '@/lib/db/schema/index';
import { eq, desc, asc, ilike, or, and, sql, count } from 'drizzle-orm';

// Funciones para Consultas
export async function createConsultation(data: {
  patientId: string;
  title: string;
  motivoConsulta?: string;
  anamnesis?: string;
  pruebas?: string;
  diagnostico?: string;
  recomendaciones?: string;
  status?: string;
}) {
  const [consultation] = await db.insert(consultations).values(data).returning();
  return consultation;
}

export async function getConsultationsByPatient(patientId: string) {
  return await db
    .select()
    .from(consultations)
    .where(eq(consultations.patientId, patientId))
    .orderBy(desc(consultations.date));
}

export async function getConsultationById(consultationId: string) {
  const [consultation] = await db
    .select()
    .from(consultations)
    .where(eq(consultations.id, consultationId));
  return consultation;
}

export async function getConsultationWithDetails(consultationId: string) {
  const consultation = await db.query.consultations.findFirst({
    where: eq(consultations.id, consultationId),
    with: {
      patient: true,
      transcriptions: true,
      aiDiagnoses: true,
    },
  });
  return consultation;
}

// Funciones para Transcripciones
export async function createTranscription(data: {
  consultationId: string;
  fullText: string;
  segments?: unknown;
  duration?: number;
  language?: string;
  languageProbability?: number;
  filename?: string;
}) {
  const [transcription] = await db.insert(transcriptions).values(data).returning();
  return transcription;
}

export async function getTranscriptionsByConsultation(consultationId: string) {
  return await db
    .select()
    .from(transcriptions)
    .where(eq(transcriptions.consultationId, consultationId))
    .orderBy(desc(transcriptions.createdAt));
}

// Funciones para Diagnósticos IA
export async function createAiDiagnosis(data: {
  consultationId: string;
  diagnosis: string;
  confidence?: number;
  recommendations?: unknown;
  modelUsed?: string;
}) {
  const [aiDiagnosis] = await db.insert(aiDiagnoses).values(data).returning();
  return aiDiagnosis;
}

export async function getLatestDiagnosisByConsultation(consultationId: string) {
  const [diagnosis] = await db
    .select()
    .from(aiDiagnoses)
    .where(eq(aiDiagnoses.consultationId, consultationId))
    .orderBy(desc(aiDiagnoses.createdAt))
    .limit(1);
  return diagnosis;
}

// Función completa para procesar una consulta con transcripción y diagnóstico
export async function processConsultation(data: {
  patientId: string;
  title: string;
  motivoConsulta?: string;
  anamnesis?: string;
  pruebas?: string;
  diagnostico?: string;
  recomendaciones?: string;
  audioFile: File;
}) {
  // 1. Crear la consulta
  const consultation = await createConsultation({
    patientId: data.patientId,
    title: data.title,
    motivoConsulta: data.motivoConsulta,
    anamnesis: data.anamnesis,
    pruebas: data.pruebas,
    diagnostico: data.diagnostico,
    recomendaciones: data.recomendaciones,
    status: 'in-progress',
  });

  // 2. Enviar audio al backend para transcripción
  const formData = new FormData();
  formData.append('file', data.audioFile);

  const transcriptionResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/transcribe_file`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const transcriptionData = await transcriptionResponse.json();

  if (!transcriptionData.success) {
    throw new Error('Error transcribiendo audio');
  }

  // 3. Guardar transcripción en la base de datos
  const transcription = await createTranscription({
    consultationId: consultation.id,
    fullText: transcriptionData.full_text,
    segments: transcriptionData.segments,
    duration: transcriptionData.duration,
    language: transcriptionData.language,
    languageProbability: Math.round(transcriptionData.language_probability * 100),
    filename: transcriptionData.filename,
  });

  // 4. Aquí puedes agregar la lógica para generar el diagnóstico con IA
  // Por ahora retornamos la consulta y transcripción
  return {
    consultation,
    transcription,
  };
}

