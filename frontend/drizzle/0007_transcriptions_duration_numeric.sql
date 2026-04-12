ALTER TABLE "transcriptions"
ALTER COLUMN "duration" TYPE numeric(10, 2)
USING "duration"::numeric;