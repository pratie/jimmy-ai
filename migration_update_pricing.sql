-- Safe migration script for pricing plan updates
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Add BillingInterval enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add new columns to Billings table (with defaults)
ALTER TABLE "Billings"
  ADD COLUMN IF NOT EXISTS "messageCredits" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "messagesUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "messagesResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY';

-- 3. Add new columns to Domain table
ALTER TABLE "Domain"
  ADD COLUMN IF NOT EXISTS "knowledgeBaseSizeMB" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "trainingSourcesUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 4. Update Plans enum (rename old values to new ones)
-- First, create new enum
DO $$ BEGIN
  CREATE TYPE "Plans_new" AS ENUM ('FREE', 'STARTER', 'PRO', 'BUSINESS');
EXCEPTION
  WHEN duplicate_object THEN
    DROP TYPE "Plans_new";
    CREATE TYPE "Plans_new" AS ENUM ('FREE', 'STARTER', 'PRO', 'BUSINESS');
END $$;

-- 5. Migrate existing plan data
-- STANDARD -> FREE, PRO -> PRO, ULTIMATE -> BUSINESS
UPDATE "Billings"
SET plan = (
  CASE plan::text
    WHEN 'STANDARD' THEN 'FREE'::text
    WHEN 'PRO' THEN 'PRO'::text
    WHEN 'ULTIMATE' THEN 'BUSINESS'::text
    ELSE 'FREE'::text
  END
)::Plans;

-- 6. Replace old enum with new one
ALTER TABLE "Billings"
  ALTER COLUMN "plan" TYPE "Plans_new" USING plan::text::"Plans_new";

DROP TYPE "Plans";
ALTER TYPE "Plans_new" RENAME TO "Plans";

-- 7. Set default plan to FREE
ALTER TABLE "Billings"
  ALTER COLUMN "plan" SET DEFAULT 'FREE';

-- 8. Update message credits based on new plan
UPDATE "Billings"
SET "messageCredits" = CASE plan::text
  WHEN 'FREE' THEN 100
  WHEN 'STARTER' THEN 2000
  WHEN 'PRO' THEN 5000
  WHEN 'BUSINESS' THEN 10000
  ELSE 100
END,
"messagesUsed" = 0,
"messagesResetAt" = CURRENT_TIMESTAMP + INTERVAL '30 days';

COMMIT;

-- Verify the changes
SELECT plan, "messageCredits", "messagesUsed", "billingInterval" FROM "Billings";
SELECT COUNT(*) as total_users FROM "User";
SELECT COUNT(*) as total_billings FROM "Billings";
