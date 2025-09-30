-- Migration: Add Anonymous Conversations Support
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns to ChatRoom table
ALTER TABLE "ChatRoom"
ADD COLUMN IF NOT EXISTS "anonymousId" TEXT,
ADD COLUMN IF NOT EXISTS "domainId" UUID;

-- Step 2: Add foreign key constraint for domainId
ALTER TABLE "ChatRoom"
ADD CONSTRAINT "ChatRoom_domainId_fkey"
FOREIGN KEY ("domainId")
REFERENCES "Domain"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "ChatRoom_domainId_idx" ON "ChatRoom"("domainId");
CREATE INDEX IF NOT EXISTS "ChatRoom_anonymousId_idx" ON "ChatRoom"("anonymousId");

-- Step 4: Migrate existing ChatRooms to link with Domain (via Customer)
-- This populates domainId for existing chat rooms
UPDATE "ChatRoom" cr
SET "domainId" = c."domainId"
FROM "Customer" c
WHERE cr."customerId" = c.id
AND cr."domainId" IS NULL;

-- Step 5: Verification query (optional - check your data)
SELECT
  COUNT(*) as total_chatrooms,
  COUNT("customerId") as chatrooms_with_customer,
  COUNT("anonymousId") as anonymous_chatrooms,
  COUNT("domainId") as chatrooms_linked_to_domain
FROM "ChatRoom";

-- Step 6: Check schema changes applied correctly
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ChatRoom'
  AND column_name IN ('anonymousId', 'domainId')
ORDER BY column_name;