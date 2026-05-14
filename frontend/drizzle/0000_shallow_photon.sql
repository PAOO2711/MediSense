CREATE TABLE "ai_diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid,
	"transcription_id" uuid,
	"diagnosis" text NOT NULL,
	"confidence" integer,
	"recommendations" jsonb,
	"model_used" text DEFAULT 'gemini-2.5-flash',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_diagnoses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" integer,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "patients" (
	"dni" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"date_of_birth" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "transcriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid,
	"full_text" text NOT NULL,
	"segments" jsonb,
	"duration" integer,
	"language" text DEFAULT 'es',
	"language_probability" integer,
	"filename" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transcriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_diagnoses" ADD CONSTRAINT "ai_diagnoses_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_diagnoses" ADD CONSTRAINT "ai_diagnoses_transcription_id_transcriptions_id_fk" FOREIGN KEY ("transcription_id") REFERENCES "public"."transcriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_patients_dni_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("dni") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD CONSTRAINT "transcriptions_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;