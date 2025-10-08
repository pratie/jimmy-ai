-- ================================================
-- FIX: Vector Search Function Missing
-- ================================================
-- Run this SQL in your Supabase SQL Editor or database client
-- This fixes the error: "function match_knowledge_chunks does not exist"

-- ================================================
-- STEP 1: Enable pgvector extension (if not already enabled)
-- ================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================
-- STEP 2: Drop and recreate the function to ensure it's correct
-- ================================================
DROP FUNCTION IF EXISTS match_knowledge_chunks(vector, float, int, text);

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
-- STEP 3: Verify the function exists
-- ================================================
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'match_knowledge_chunks';

-- ================================================
-- Expected output:
-- routine_name           | routine_type
-- ----------------------|-------------
-- match_knowledge_chunks | FUNCTION
-- ================================================
