-- Add antecedentes_snapshot column to consultations table
ALTER TABLE "consultations" ADD COLUMN IF NOT EXISTS "antecedentes_snapshot" jsonb;
