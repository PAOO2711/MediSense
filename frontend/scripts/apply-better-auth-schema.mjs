import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

try {
  await sql.begin(async (tx) => {
    await tx.unsafe(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "email_verified" boolean NOT NULL DEFAULT false,
        "image" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY,
        "expires_at" timestamp NOT NULL,
        "token" text NOT NULL UNIQUE,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "ip_address" text,
        "user_agent" text,
        "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade
      );

      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY,
        "account_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "access_token" text,
        "refresh_token" text,
        "id_token" text,
        "access_token_expires_at" timestamp,
        "refresh_token_expires_at" timestamp,
        "scope" text,
        "password" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "jwks" (
        "id" text PRIMARY KEY,
        "publicKey" text NOT NULL,
        "privateKey" text NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "expiresAt" timestamp
      );

      CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("user_id");
      CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("user_id");
      CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");

      ALTER TABLE "user"
      ALTER COLUMN "id"
      SET DEFAULT gen_random_uuid();
    `);

    await tx.unsafe(`
      DO $$
      DECLARE r record;
      BEGIN
        FOR r IN
          SELECT c.conname
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE t.relname = 'patients' AND c.contype = 'f'
        LOOP
          EXECUTE format('ALTER TABLE patients DROP CONSTRAINT IF EXISTS %I', r.conname);
        END LOOP;
      END
      $$;
    `);

    // Backfill users so existing patients.owner_id values remain valid.
    await tx.unsafe(`
      INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
      SELECT
        au.id,
        COALESCE(NULLIF(split_part(au.email, '@', 1), ''), 'usuario_' || left(au.id::text, 8)),
        COALESCE(NULLIF(au.email, ''), au.id::text || '@migrated.local'),
        true,
        now(),
        now()
      FROM auth.users au
      WHERE au.id IN (SELECT DISTINCT owner_id FROM patients)
      ON CONFLICT (id) DO NOTHING;
    `);

    await tx.unsafe(`
      INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
      SELECT
        p.owner_id,
        'usuario_' || left(p.owner_id::text, 8),
        p.owner_id::text || '@migrated.local',
        true,
        now(),
        now()
      FROM (SELECT DISTINCT owner_id FROM patients) p
      WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = p.owner_id)
      ON CONFLICT (id) DO NOTHING;
    `);

    await tx.unsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'patients_owner_id_user_id_fk'
        ) THEN
          ALTER TABLE patients
            ADD CONSTRAINT patients_owner_id_user_id_fk
            FOREIGN KEY (owner_id) REFERENCES "user"(id)
            ON DELETE RESTRICT;
        END IF;
      END
      $$;
    `);
  });

  console.log('OK: Better Auth tables and owner FK migration applied.');
} finally {
  await sql.end({ timeout: 5 });
}
