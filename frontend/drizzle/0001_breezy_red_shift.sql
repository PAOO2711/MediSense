CREATE TABLE "patient_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" integer NOT NULL,
	"antecedente" text NOT NULL,
	"status" text DEFAULT 'activo' NOT NULL,
	"diagnosticado_en" timestamp NOT NULL,
	"consultation_id" uuid NOT NULL,
	"resolved_in_consultation_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "motivo_consulta" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "anamnesis" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "pruebas" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "diagnostico" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "recomendaciones" text;--> statement-breakpoint
ALTER TABLE "patient_history" ADD CONSTRAINT "patient_history_patient_id_patients_dni_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("dni") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_history" ADD CONSTRAINT "patient_history_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_history" ADD CONSTRAINT "patient_history_resolved_in_consultation_id_consultations_id_fk" FOREIGN KEY ("resolved_in_consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" DROP COLUMN "description";