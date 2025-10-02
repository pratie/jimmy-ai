-- ================================================
-- Supabase pgvector Setup for Corinna AI RAG
-- ================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This script:
-- 1. Enables pgvector extension
-- 2. Creates KnowledgeChunk table with vector column
-- 3. Creates vector index for fast similarity search
-- 4. Creates RPC function for vector search

-- ================================================
-- STEP 1: Enable pgvector extension
-- ================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================
-- STEP 2: Create KnowledgeChunk table
-- ================================================
-- This table stores embedded text chunks for RAG retrieval

CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "domainId" UUID NOT NULL,
  "chatBotId" UUID NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  "sourceType" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "sourceName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KnowledgeChunk_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "KnowledgeChunk_chatBotId_fkey" FOREIGN KEY ("chatBotId") REFERENCES "ChatBot"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_domainId_idx" ON "KnowledgeChunk"("domainId");
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_chatBotId_idx" ON "KnowledgeChunk"("chatBotId");
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_sourceType_idx" ON "KnowledgeChunk"("sourceType");

-- ================================================
-- STEP 3: Create HNSW index for fast cosine similarity search
-- ================================================
-- This index speeds up vector similarity queries
-- HNSW (Hierarchical Navigable Small World) is optimal for high-dimensional vectors

CREATE INDEX IF NOT EXISTS knowledge_chunk_embedding_idx
ON "KnowledgeChunk"
USING hnsw (embedding vector_cosine_ops);

-- ================================================
-- STEP 4: Create RPC function for vector search
-- ================================================
-- This function performs cosine similarity search and returns top N results
-- Called from src/lib/vector-search.ts via Prisma.$queryRaw

CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_domain_id text
)
RETURNS TABLE (
  id text,
  content text,
  similarity float,
  "sourceType" text,
  "sourceUrl" text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    "KnowledgeChunk".id::text,
    "KnowledgeChunk".content,
    1 - ("KnowledgeChunk".embedding <=> query_embedding) AS similarity,
    "KnowledgeChunk"."sourceType",
    "KnowledgeChunk"."sourceUrl"
  FROM "KnowledgeChunk"
  WHERE
    "KnowledgeChunk"."domainId"::text = filter_domain_id
    AND "KnowledgeChunk".embedding IS NOT NULL
    AND 1 - ("KnowledgeChunk".embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify setup is correct:

-- Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if index exists (run after migration)
-- SELECT indexname FROM pg_indexes WHERE tablename = 'KnowledgeChunk';

-- Test RPC function (run after you have some embeddings)
-- SELECT * FROM match_knowledge_chunks(
--   '[0.1, 0.2, ...]'::vector,  -- Replace with real embedding
--   0.5::float,
--   5::int,
--   'your-domain-id'::text
-- );

-- ================================================
-- NOTES
-- ================================================
-- 1. This script creates everything needed for RAG vector search
-- 2. Run this entire script in Supabase SQL Editor
-- 3. After running, execute `prisma db pull` and `prisma generate` to sync Prisma
-- 4. The <=> operator is cosine distance (0 = identical, 2 = opposite)
-- 5. We use (1 - distance) to get similarity score (0-1, higher = more similar)
