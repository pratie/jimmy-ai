-- Safe migration script for pricing plan updates v2
-- This version handles case where Plans enum might not exist yet
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Check current Billings table structure
-- Run this first to see what we're working with:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Billings';

-- 2. Create BillingInterval enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create new Plans enum
DO $$ BEGIN
  CREATE TYPE "Plans" AS ENUM ('FREE', 'STARTER', 'PRO', 'BUSINESS');
EXCEPTION
  WHEN duplicate_object THEN
    -- If it exists, drop and recreate
    DROP TYPE "Plans" CASCADE;
    CREATE TYPE "Plans" AS ENUM ('FREE', 'STARTER', 'PRO', 'BUSINESS');
END $$;

-- 4. Add new columns to Billings table if they don't exist
ALTER TABLE "Billings"
  ADD COLUMN IF NOT EXISTS "plan" "Plans" NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS "messageCredits" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "messagesUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "messagesResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN IF NOT EXISTS "provider" TEXT,
  ADD COLUMN IF NOT EXISTS "providerSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 5. Create unique constraint on providerSubscriptionId if it doesn't exist
DO $$ BEGIN
  ALTER TABLE "Billings" ADD CONSTRAINT "Billings_providerSubscriptionId_key" UNIQUE ("providerSubscriptionId");
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- 6. Add new columns to Domain table
ALTER TABLE "Domain"
  ADD COLUMN IF NOT EXISTS "knowledgeBaseSizeMB" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "trainingSourcesUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 7. Update all existing billing records to have proper defaults
UPDATE "Billings"
SET
  "messageCredits" = 100,
  "messagesUsed" = 0,
  "messagesResetAt" = CURRENT_TIMESTAMP + INTERVAL '30 days',
  "plan" = 'FREE'
WHERE "messageCredits" IS NULL OR "messagesUsed" IS NULL;

COMMIT;

-- Verify the changes
SELECT id, plan, "messageCredits", "messagesUsed", "billingInterval" FROM "Billings" LIMIT 10;
SELECT COUNT(*) as total_users FROM "User";
SELECT COUNT(*) as total_billings FROM "Billings";
