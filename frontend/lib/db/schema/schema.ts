import { pgTable, pgSchema, serial, text, timestamp, integer, boolean, jsonb, uuid, numeric } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

const auth = pgSchema('auth');
const authUsers = auth.table('users', {
  id: uuid('id').primaryKey(),
});

// Tabla de pacientes
export const patients = pgTable('patients', {
  dni: text('dni').primaryKey().notNull(),
  ownerId: uuid('owner_id')
    .notNull()
    .default(sql`auth.uid()`)
    .references(() => authUsers.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}).enableRLS();

// Tabla de consultas médicas
export const consultations = pgTable('consultations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  patientId: text('patient_id').references(() => patients.dni),
  title: text('title').notNull(),
  motivoConsulta: text('motivo_consulta'),
  anamnesis: text('anamnesis'),
  pruebas: text('pruebas'),
  diagnostico: text('diagnostico'),
  recomendaciones: text('recomendaciones'),
  date: timestamp('date').defaultNow().notNull(),
  status: text('status').default('pending'), // pending, in-progress, completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}).enableRLS();

// Tabla de transcripciones de audio
export const transcriptions = pgTable('transcriptions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  consultationId: uuid('consultation_id').references(() => consultations.id),
  fullText: text('full_text').notNull(),
  segments: jsonb('segments'), // Almacenar los segmentos con timestamps
  duration: numeric('duration', { mode: 'number' }), // Duración en segundos con decimales
  language: text('language').default('es'),
  languageProbability: integer('language_probability'), // Probabilidad como porcentaje (0-100)
  filename: text('filename'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

// Tabla de diagnósticos generados por IA
export const aiDiagnoses = pgTable('ai_diagnoses', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  consultationId: uuid('consultation_id').references(() => consultations.id),
  diagnosis: text('diagnosis').notNull(),
  confidence: integer('confidence'), // Confianza del diagnóstico (0-100)
  recommendations: jsonb('recommendations'), // Array de recomendaciones
  modelUsed: text('model_used').default('gemini-2.5-flash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

// Tabla de historial médico del paciente (antecedentes)
export const patientHistory = pgTable('patient_history', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  patientId: text('patient_id').references(() => patients.dni).notNull(),
  antecedente: text('antecedente').notNull(), // Condición médica/diagnóstico
  resumen: text('resumen'), // Resumen del análisis de IA de la consulta
  status: text('status').notNull().default('activo'), // 'activo' o 'resuelto'
  diagnosticadoEn: timestamp('diagnosticado_en').notNull(),
  consultationId: uuid('consultation_id').references(() => consultations.id).notNull(), // Consulta donde se diagnosticó
  resolvedInConsultationId: uuid('resolved_in_consultation_id').references(() => consultations.id), // Consulta donde se resolvió
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}).enableRLS();

export const role = pgTable('roles', {
  id: uuid('id').primaryKey().notNull().references(() => authUsers.id, { onDelete: 'restrict' }),
  role: text('role').notNull(), // 'admin' o 'user'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}).enableRLS();

export const doctors = pgTable('doctors', {
  dni: text('dni').primaryKey().notNull(),
  id: uuid('id').notNull().unique().references(() => authUsers.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
}).enableRLS();

// Relaciones
export const patientsRelations = relations(patients, ({ many }) => ({
  consultations: many(consultations),
  patientHistory: many(patientHistory),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(patients, {
    fields: [consultations.patientId],
    references: [patients.dni],
  }),
  transcriptions: many(transcriptions),
  aiDiagnoses: many(aiDiagnoses),
}));

export const transcriptionsRelations = relations(transcriptions, ({ one, many }) => ({
  consultation: one(consultations, {
    fields: [transcriptions.consultationId],
    references: [consultations.id],
  }),
  aiDiagnoses: many(aiDiagnoses),
}));

export const aiDiagnosesRelations = relations(aiDiagnoses, ({ one }) => ({
  consultation: one(consultations, {
    fields: [aiDiagnoses.consultationId],
    references: [consultations.id],
  }),
}));

export const patientHistoryRelations = relations(patientHistory, ({ one }) => ({
  patient: one(patients, {
    fields: [patientHistory.patientId],
    references: [patients.dni],
  }),
  consultation: one(consultations, {
    fields: [patientHistory.consultationId],
    references: [consultations.id],
  }),
}));

// Tipos TypeScript inferidos del schema
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;

export type Transcription = typeof transcriptions.$inferSelect;
export type NewTranscription = typeof transcriptions.$inferInsert;

export type AiDiagnosis = typeof aiDiagnoses.$inferSelect;
export type NewAiDiagnosis = typeof aiDiagnoses.$inferInsert;

export type PatientHistory = typeof patientHistory.$inferSelect;
export type NewPatientHistory = typeof patientHistory.$inferInsert;

export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
