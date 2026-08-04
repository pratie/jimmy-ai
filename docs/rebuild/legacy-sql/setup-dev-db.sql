-- Setup pgvector extension for DEV database
-- Run this in Supabase SQL Editor for your DEV project (vroajgqswlsrssjvhrrm)

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the vector search function for RAG
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  domain_id_filter text
)
RETURNS TABLE (
  id text,
  content text,
  similarity float,
  "sourceType" text,
  "sourceUrl" text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    "KnowledgeChunk".id::text,
    "KnowledgeChunk".content,
    1 - ("KnowledgeChunk".embedding <=> query_embedding) AS similarity,
    "KnowledgeChunk"."sourceType",
    "KnowledgeChunk"."sourceUrl"
  FROM "KnowledgeChunk"
  WHERE "KnowledgeChunk"."domainId"::text = domain_id_filter
    AND 1 - ("KnowledgeChunk".embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
