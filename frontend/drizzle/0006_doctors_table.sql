CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"email" text,
	"phone" text,
	"date_of_birth" timestamp,
	CONSTRAINT "doctors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "doctors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;
