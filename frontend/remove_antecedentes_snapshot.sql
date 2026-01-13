-- Remove antecedentes_snapshot column from consultations table
ALTER TABLE "consultations" DROP COLUMN IF EXISTS "antecedentes_snapshot";
