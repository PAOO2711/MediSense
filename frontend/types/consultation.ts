// Patient types
export type Patient = {
  dni: number;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

// Consultation types
export type Consultation = {
  id: string;
  patientId: number | null;
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
  patientId: number;
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
};
