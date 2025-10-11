-- Fix vector index for embeddings
-- This removes the btree index and creates a proper pgvector index
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Drop the problematic btree index
DROP INDEX IF EXISTS "knowledge_chunk_embedding_idx";

-- 2. Create a proper ivfflat index for vector similarity search
-- This is the correct index type for pgvector
CREATE INDEX IF NOT EXISTS "knowledge_chunk_embedding_ivfflat_idx"
ON "KnowledgeChunk"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Alternative: If you want to use HNSW index (faster but more memory):
-- CREATE INDEX IF NOT EXISTS "knowledge_chunk_embedding_hnsw_idx"
-- ON "KnowledgeChunk"
-- USING hnsw (embedding vector_cosine_ops);

COMMIT;

-- Verify the index was created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'KnowledgeChunk';
