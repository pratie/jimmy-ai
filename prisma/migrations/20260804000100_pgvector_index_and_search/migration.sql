-- ═══════════════════════════════════════════════════════════════════════════
-- pgvector: HNSW index + tenant-scoped retrieval function
--
-- Everything in this file is what Prisma CANNOT express. It is tracked as a
-- normal migration on purpose — this is the infrastructure that previously
-- lived in supabase-vector-setup.sql and was applied by pasting it into the
-- Supabase SQL editor, which is exactly how the schema drifted.
--
-- The extension itself is created by the baseline migration (Prisma emits it
-- from `extensions = [vector, pgcrypto]`), so it is not repeated here.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── HNSW index ─────────────────────────────────────────────────────────────
-- Cosine distance, matching OpenAI text-embedding-3-small (normalised vectors).
--
-- m / ef_construction are the defaults (16 / 64). They are stated explicitly so
-- a future change is a visible diff rather than an invisible default shift.
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_embedding_hnsw_idx"
  ON "KnowledgeChunk"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Supporting b-tree for the tenant predicate. The HNSW scan is filtered by
-- clientWorkspaceId, so the planner needs this to keep the filter cheap.
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_tenant_scope_idx"
  ON "KnowledgeChunk" ("clientWorkspaceId", "embeddingVersion");


-- ── Tenant-scoped similarity search ────────────────────────────────────────
-- Replaces the old `match_knowledge_chunks`, which searched the ENTIRE corpus
-- and left scoping to the caller. That design made a cross-tenant leak one
-- forgotten WHERE clause away.
--
-- Here the tenant is a REQUIRED, non-defaulted argument and is applied inside
-- the query. There is no way to call this function without scoping it.
--
-- p_assistant_id is optional: when provided, retrieval is further narrowed to
-- the knowledge sources actually enabled for that assistant, so one workspace
-- can hold shared knowledge while assistants use different subsets of it.

DROP FUNCTION IF EXISTS match_knowledge_chunks(vector, double precision, integer, uuid);
DROP FUNCTION IF EXISTS match_knowledge_chunks(vector, float, int, uuid);

CREATE OR REPLACE FUNCTION match_knowledge_chunks_scoped(
  p_client_workspace_id uuid,          -- REQUIRED. No default, by design.
  p_query_embedding     vector(1536),
  p_match_count         int     DEFAULT 8,
  p_match_threshold     float   DEFAULT 0.0,
  p_assistant_id        uuid    DEFAULT NULL,
  p_embedding_version   int     DEFAULT 1
)
RETURNS TABLE (
  id                    uuid,
  "knowledgeDocumentId" uuid,
  content               text,
  similarity            float,
  "canonicalUrl"        text,
  title                 text
)
LANGUAGE sql
STABLE
-- Not SECURITY DEFINER: the function must run with the caller's privileges so
-- Postgres-level policies still apply. Elevating here would silently bypass RLS.
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    kc.id,
    kc."knowledgeDocumentId",
    kc.content,
    1 - (kc.embedding <=> p_query_embedding) AS similarity,
    kd."canonicalUrl",
    kd.title
  FROM "KnowledgeChunk" kc
  JOIN "KnowledgeDocument" kd
    ON kd.id = kc."knowledgeDocumentId"
  WHERE
    -- Tenant boundary. Non-negotiable and first.
    kc."clientWorkspaceId" = p_client_workspace_id
    AND kc."embeddingVersion" = p_embedding_version
    AND kc.embedding IS NOT NULL
    AND kd."deletedAt" IS NULL
    AND kd.status = 'active'
    -- Optional assistant-level source selection.
    AND (
      p_assistant_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM "AssistantKnowledgeSource" aks
        WHERE aks."assistantId"       = p_assistant_id
          AND aks."knowledgeSourceId" = kd."knowledgeSourceId"
          AND aks.enabled
      )
    )
    AND (1 - (kc.embedding <=> p_query_embedding)) >= p_match_threshold
  ORDER BY kc.embedding <=> p_query_embedding
  LIMIT LEAST(GREATEST(p_match_count, 1), 100);   -- hard ceiling: cost guard
$$;

COMMENT ON FUNCTION match_knowledge_chunks_scoped IS
  'Tenant-scoped RAG retrieval. p_client_workspace_id is required and applied '
  'inside the query — never filter results in application code afterwards.';


-- ── Recall note ────────────────────────────────────────────────────────────
-- HNSW applies its filter AFTER the graph walk, so a highly selective tenant
-- predicate can return fewer than p_match_count rows at default ef_search (40).
-- Callers that need consistent recall should raise it for the transaction:
--
--   SET LOCAL hnsw.ef_search = 100;
--
-- This is done in the application (src/lib/vector-search.ts) rather than set
-- globally, so a large-corpus tenant does not pay the cost on every query.
