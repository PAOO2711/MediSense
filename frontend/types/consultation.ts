// Patient types
export type Patient = {
  dni: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth?: Date | string | null;
  age?: number | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

// Consultation types
export type Consultation = {
  id: string;
  patientId: string | null;
  title: string;
  motivoConsulta: string | null;
  description: string | null;
  anamnesis: string | null;
  pruebas: string | null;
  diagnostico: string | null;
  recomendaciones: string | null;
  date: Date | string;
  status: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

// Transcription types
export type Transcription = {
  id: string;
  consultationId: string;
  fullText: string;
  createdAt: string;
};

// Patient History types
export type PatientHistory = {
  id: string;
  patientId: string;
  antecedente: string;
  resumen: string | null;
  status: 'activo' | 'resuelto';
  diagnosticadoEn: string;
  consultationId: string;
  resolvedInConsultationId: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type AISuggestion = {
  id: string;
  type: 'symptom' | 'condition' | 'recommendation';
  text: string;
  confidence: number;
  description?: string;
  source: 'identified' | 'suggested';
};
