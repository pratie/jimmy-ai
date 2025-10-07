-- Remove old credits column from Billings table
-- Run this in Supabase SQL Editor

BEGIN;

ALTER TABLE "Billings" DROP COLUMN IF EXISTS "credits";

COMMIT;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Billings'
ORDER BY ordinal_position;
