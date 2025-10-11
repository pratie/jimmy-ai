-- Fix vector column to have proper dimensions
-- OpenAI embeddings are 1536 dimensions
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Drop the old column if it exists (backup data first if you have any)
ALTER TABLE "KnowledgeChunk" DROP COLUMN IF EXISTS embedding;

-- 2. Add the column with proper vector dimensions (1536 for OpenAI text-embedding-ada-002)
ALTER TABLE "KnowledgeChunk"
ADD COLUMN embedding vector(1536);

-- 3. Create the proper ivfflat index for vector similarity search
DROP INDEX IF EXISTS "knowledge_chunk_embedding_idx";
DROP INDEX IF EXISTS "knowledge_chunk_embedding_ivfflat_idx";

CREATE INDEX "knowledge_chunk_embedding_ivfflat_idx"
ON "KnowledgeChunk"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

COMMIT;

-- Verify the column and index
SELECT
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'KnowledgeChunk' AND column_name = 'embedding';

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'KnowledgeChunk' AND indexname LIKE '%embedding%';
