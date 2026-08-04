-- ================================================
-- FIX: Add Unique Constraint to Customer Table
-- ================================================
-- Prevents duplicate customers with same email per domain
-- Enables safe upsert operations for race condition prevention
-- Run this in your PostgreSQL database

-- ================================================
-- STEP 1: Check for existing duplicates before adding constraint
-- ================================================
-- This query finds any duplicate email+domainId combinations
SELECT
  email,
  "domainId",
  COUNT(*) as duplicate_count
FROM "Customer"
WHERE email IS NOT NULL AND "domainId" IS NOT NULL
GROUP BY email, "domainId"
HAVING COUNT(*) > 1;

-- ================================================
-- STEP 2: (OPTIONAL) Clean up duplicates if found
-- ================================================
-- If the query above returns rows, you need to clean them up first
-- This keeps the oldest customer and deletes newer duplicates

-- UNCOMMENT AND RUN ONLY IF YOU HAVE DUPLICATES:
/*
WITH ranked_customers AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY email, "domainId"
      ORDER BY "createdAt" ASC
    ) as rn
  FROM "Customer"
  WHERE email IS NOT NULL AND "domainId" IS NOT NULL
)
DELETE FROM "Customer"
WHERE id IN (
  SELECT id FROM ranked_customers WHERE rn > 1
);
*/

-- ================================================
-- STEP 3: Add unique constraint
-- ================================================
-- Create unique constraint on email + domainId combination
-- This prevents race conditions in customer creation

ALTER TABLE "Customer"
ADD CONSTRAINT "email_domainId"
UNIQUE (email, "domainId");

-- ================================================
-- STEP 4: Verify constraint was created
-- ================================================
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = '"Customer"'::regclass
  AND conname = 'email_domainId';

-- ================================================
-- Expected output:
-- constraint_name  | constraint_type | constraint_definition
-- ----------------|-----------------|----------------------
-- email_domainId  | u               | UNIQUE (email, "domainId")
-- ================================================

-- ================================================
-- STEP 5: Test the constraint (optional)
-- ================================================
-- Try inserting duplicate - should fail with error:
-- ERROR: duplicate key value violates unique constraint "email_domainId"

/*
INSERT INTO "Customer" (id, email, "domainId")
VALUES
  (gen_random_uuid(), 'test@example.com', 'some-domain-uuid'),
  (gen_random_uuid(), 'test@example.com', 'some-domain-uuid'); -- Should fail
*/

-- ================================================
-- NOTES FOR PRODUCTION DEPLOYMENT:
-- ================================================
-- 1. This migration should be run BEFORE deploying the new code
-- 2. If you have existing duplicates, clean them up first (STEP 2)
-- 3. The constraint allows NULL values (multiple NULL emails per domain)
-- 4. After this migration, the streaming API will use upsert safely
-- ================================================
