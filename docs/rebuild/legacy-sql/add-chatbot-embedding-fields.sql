-- Add embedding status tracking fields to ChatBot table
-- Run this in Supabase SQL Editor

ALTER TABLE "ChatBot"
ADD COLUMN IF NOT EXISTS "embeddingStatus" TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS "embeddingProgress" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "embeddingChunksTotal" INTEGER,
ADD COLUMN IF NOT EXISTS "embeddingChunksProcessed" INTEGER,
ADD COLUMN IF NOT EXISTS "embeddingCompletedAt" TIMESTAMP(3);

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ChatBot'
AND column_name LIKE 'embedding%';
