# Multi-Query RAG with Jina Reranker - Implementation Plan

## Overview

Implement an optimized RAG pipeline that uses query expansion, parallel retrieval, and semantic reranking to improve answer quality by 30-40% while maintaining fast response times.

---

## Pipeline Architecture

```
User Query: "What's your pricing?"
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 1: QUERY EXPANSION (JSON Output)                  │
│ Generate 3 alternative phrasings                        │
│ Model: GPT-4o-mini (~200ms)                             │
│ Output: ["How much does it cost?",                      │
│          "What are your subscription plans?",           │
│          "What do you charge for services?"]            │
│ Total: 4 queries (1 original + 3 variations)            │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: PARALLEL EMBEDDINGS                             │
│ Batch generate embeddings for all 4 queries             │
│ Model: OpenAI text-embedding-3-small                    │
│ Latency: ~150ms (parallel via Promise.all)              │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: PARALLEL VECTOR SEARCHES                        │
│ 4 parallel pgvector searches (5 chunks each)            │
│ Threshold: 0.3 (prioritize recall)                      │
│ Total: 20 chunks (4 queries × 5 chunks)                 │
│ Latency: ~100ms (DB queries in parallel)                │
└─────────────────────────────────────────────────────────┘
         ↓
    Query 1 → [chunk_a, chunk_b, chunk_c, chunk_d, chunk_e]
    Query 2 → [chunk_f, chunk_g, chunk_a, chunk_h, chunk_i]
    Query 3 → [chunk_j, chunk_k, chunk_b, chunk_l, chunk_m]
    Query 4 → [chunk_n, chunk_o, chunk_p, chunk_q, chunk_r]
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: DEDUPLICATION                                   │
│ Remove duplicate chunks by ID                           │
│ Result: ~15-20 unique chunks                            │
│ Latency: <5ms (in-memory operation)                     │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: JINA RERANKER                                   │
│ Rerank against ORIGINAL user query                      │
│ Model: jina-reranker-v2-base-multilingual               │
│ Input: 15-20 chunks                                     │
│ Output: Top 3 best chunks                               │
│ Latency: ~50ms                                          │
└─────────────────────────────────────────────────────────┘
         ↓
    Top 3 chunks: [chunk_a, chunk_h, chunk_k]
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 6: INJECT INTO PROMPT & LLM GENERATION             │
│ Format top 3 chunks as context                          │
│ Send to LLM (GPT-4o/Claude/Gemini)                      │
│ Stream response via SSE                                 │
└─────────────────────────────────────────────────────────┘
```

**Total RAG Pipeline Latency: ~500ms**

---

## Performance Metrics

### Speed Optimizations

| Step | Optimization | Latency |
|------|--------------|---------|
| Query Expansion | GPT-4o-mini with JSON mode | ~200ms |
| Embeddings | Batch 4 queries in parallel | ~150ms |
| Vector Searches | 4 parallel pgvector queries | ~100ms |
| Deduplication | In-memory Set operation | <5ms |
| Reranking | Jina v2 (15x faster than competitors) | ~50ms |
| **Total RAG** | | **~500ms** |

### Quality Improvements

- **+30-40%** answer quality improvement over single-query search
- **+8%** hit rate (retrieves relevant chunks more consistently)
- **+33%** MRR (Mean Reciprocal Rank)
- **100+ languages** supported via Jina multilingual reranker

### Cost Analysis

| Component | Operation | Cost per Query |
|-----------|-----------|----------------|
| Query Expansion | GPT-4o-mini (~100 tokens) | ~$0.0001 |
| Embeddings | 4 queries × OpenAI | ~$0.00004 |
| Vector Search | PostgreSQL (no API cost) | $0 |
| Jina Reranker | 20 chunks → top 3 | ~$0.00005 |
| **Total** | | **~$0.00019** |

**Monthly Cost by Plan:**
- FREE (100 msgs): $0.019 (~$0.02/month)
- STARTER (1K msgs): $0.19 (~$0.20/month)
- PRO (10K msgs): $1.90 (~$2/month)
- BUSINESS (unlimited): Variable

**Cost Increase:** ~19x vs current system, but still very affordable!

---

## Implementation Checklist

### 1. Create `src/lib/query-expansion.ts`

**Purpose:** Generate 3 query variations using structured JSON output

**Key Features:**
- Use GPT-4o-mini for speed and cost efficiency
- JSON mode or function calling for guaranteed structure
- No text parsing needed
- Caching for repeated queries (optional optimization)

**Example Implementation:**
```typescript
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

const QueryExpansionSchema = z.object({
  variations: z.array(z.string()).length(3)
})

export async function expandQuery(userQuery: string): Promise<string[]> {
  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: QueryExpansionSchema,
    prompt: `Generate 3 alternative phrasings of this query that preserve the semantic intent.
    Be specific and varied in approach. Original query: "${userQuery}"`
  })

  return result.object.variations
}
```

**Output Format:**
```json
{
  "variations": [
    "How much does it cost?",
    "What are your subscription plans?",
    "What do you charge for services?"
  ]
}
```

---

### 2. Create `src/lib/jina-reranker.ts`

**Purpose:** Rerank chunks using Jina Reranker v2 API

**Key Features:**
- Jina Reranker v2 Base Multilingual
- Rerank 15-20 chunks against original query
- Return top 3 with relevance scores
- Fallback to vector similarity on error

**Example Implementation:**
```typescript
import axios from 'axios'

export interface RerankResult {
  index: number
  relevanceScore: number
  document: {
    content: string
  }
}

export async function rerankChunks(
  originalQuery: string,
  chunks: Array<{ id: string; content: string }>,
  topN: number = 3
): Promise<Array<{ id: string; content: string; score: number }>> {
  try {
    const response = await axios.post(
      'https://api.jina.ai/v1/rerank',
      {
        model: 'jina-reranker-v2-base-multilingual',
        query: originalQuery,
        top_n: topN,
        documents: chunks.map(c => c.content),
        return_documents: false // Save bandwidth
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.JINA_API_KEY}`
        },
        timeout: 5000 // 5 second timeout
      }
    )

    // Map reranked results back to original chunks
    return response.data.results.map((result: RerankResult) => ({
      id: chunks[result.index].id,
      content: chunks[result.index].content,
      score: result.relevanceScore
    }))
  } catch (error) {
    console.error('[Reranker] Error:', error)
    // Fallback: return top N by original order (vector similarity)
    return chunks.slice(0, topN).map((chunk, idx) => ({
      ...chunk,
      score: 1 - (idx * 0.1) // Descending scores
    }))
  }
}
```

**API Response Format:**
```json
{
  "results": [
    { "index": 0, "relevanceScore": 0.95 },
    { "index": 7, "relevanceScore": 0.87 },
    { "index": 14, "relevanceScore": 0.82 }
  ]
}
```

---

### 3. Modify `src/lib/vector-search.ts`

**Purpose:** Add multi-query search function with parallel operations

**New Function:** `searchKnowledgeBaseMultiQuery()`

**Key Features:**
- Expand 1 query → 4 queries total
- Parallel embedding generation
- Parallel vector searches
- Deduplication by chunk ID
- Reranking with original query

**Example Implementation:**
```typescript
import { expandQuery } from './query-expansion'
import { rerankChunks } from './jina-reranker'
import { generateEmbedding } from './embeddings'
import { client } from './prisma'
import { devLog } from './utils'

export async function searchKnowledgeBaseMultiQuery(
  userQuery: string,
  domainId: string,
  chunksPerQuery: number = 5,
  finalTopN: number = 3
): Promise<SearchResult[]> {
  const startTime = Date.now()

  // Step 1: Query Expansion
  devLog('[Multi-Query RAG] Step 1: Expanding query...')
  const expansionStart = Date.now()
  const variations = await expandQuery(userQuery)
  const allQueries = [userQuery, ...variations] // Total: 4 queries
  devLog(`[Multi-Query RAG] ✅ Expansion took ${Date.now() - expansionStart}ms`)
  devLog(`[Multi-Query RAG] Generated ${allQueries.length} queries`)

  // Step 2: Parallel Embeddings
  devLog('[Multi-Query RAG] Step 2: Generating embeddings...')
  const embeddingStart = Date.now()
  const embeddings = await Promise.all(
    allQueries.map(q => generateEmbedding(q))
  )
  devLog(`[Multi-Query RAG] ✅ Embeddings took ${Date.now() - embeddingStart}ms`)

  // Step 3: Parallel Vector Searches
  devLog('[Multi-Query RAG] Step 3: Searching vector database...')
  const searchStart = Date.now()
  const allResults = await Promise.all(
    embeddings.map((embedding, idx) =>
      client.$queryRaw<SearchResult[]>`
        SELECT * FROM match_knowledge_chunks(
          ${embedding}::vector,
          ${0.3}::float,
          ${chunksPerQuery}::int,
          ${domainId}::text
        )
      `.then(results => {
        devLog(`[Multi-Query RAG]   Query ${idx + 1}: ${results.length} chunks`)
        return results
      })
    )
  )
  devLog(`[Multi-Query RAG] ✅ Searches took ${Date.now() - searchStart}ms`)

  // Step 4: Deduplication
  devLog('[Multi-Query RAG] Step 4: Deduplicating chunks...')
  const dedupeStart = Date.now()
  const flatResults = allResults.flat()
  const uniqueChunks = Array.from(
    new Map(flatResults.map(chunk => [chunk.id, chunk])).values()
  )
  devLog(`[Multi-Query RAG] ✅ Dedupe took ${Date.now() - dedupeStart}ms`)
  devLog(`[Multi-Query RAG] Total chunks: ${flatResults.length} → Unique: ${uniqueChunks.length}`)

  // Step 5: Reranking
  devLog('[Multi-Query RAG] Step 5: Reranking with Jina...')
  const rerankStart = Date.now()
  const reranked = await rerankChunks(userQuery, uniqueChunks, finalTopN)
  devLog(`[Multi-Query RAG] ✅ Reranking took ${Date.now() - rerankStart}ms`)
  devLog(`[Multi-Query RAG] Final top ${finalTopN} chunks selected`)

  const totalTime = Date.now() - startTime
  devLog(`[Multi-Query RAG] 🎉 Total pipeline: ${totalTime}ms`)

  return reranked
}
```

---

### 4. Update `prisma/schema.prisma`

**Purpose:** Add query expansion configuration fields

**Schema Changes:**
```prisma
model ChatBot {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  // ... existing fields ...

  // Query Expansion Settings (NEW)
  useQueryExpansion   Boolean   @default(true)   // Enable for all plans
  queryExpansionCount Int?      @default(3)      // Always 3 variations (4 total)
  chunksPerQuery      Int?      @default(5)      // 5 chunks per query
  finalTopN           Int?      @default(3)      // Top 3 after rerank

  // ... existing relationships ...
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_query_expansion_settings
```

---

### 5. Modify `src/app/api/bot/stream/route.ts`

**Purpose:** Integrate multi-query RAG pipeline

**Changes at Line ~213-233:**

```typescript
// RAG: Retrieve knowledge based on embeddings availability
const ragStartTime = Date.now()
let knowledgeBase: string

if (hasTrained) {
  devLog('[Bot Stream] 🔍 Using multi-query RAG with reranking')

  const chunksPerQuery = chatBotDomain.chatBot?.chunksPerQuery || 5
  const finalTopN = chatBotDomain.chatBot?.finalTopN || 3

  try {
    const searchResults = await searchKnowledgeBaseMultiQuery(
      message,
      domainId,
      chunksPerQuery,
      finalTopN
    )

    devLog(`[Bot Stream] ✅ Multi-query RAG took: ${Date.now() - ragStartTime}ms`)
    devLog(`[Bot Stream] ✅ Retrieved ${searchResults.length} final chunks`)

    knowledgeBase = formatResultsForPrompt(searchResults)
  } catch (error) {
    devError('[Bot Stream] Multi-query RAG failed, using fallback:', error)

    // Fallback: Single-query search
    const fallbackResults = await searchKnowledgeBase(message, domainId, 5, 0.3)
    knowledgeBase = formatResultsForPrompt(fallbackResults)
  }
} else {
  devLog('[Bot Stream] ⚠️  Using fallback: fetching truncated knowledge base (no embeddings trained)')
  const kbData = await client.chatBot.findUnique({
    where: { domainId: domainId },
    select: { knowledgeBase: true }
  })
  knowledgeBase = kbData?.knowledgeBase
    ? truncateMarkdown(kbData.knowledgeBase, 12000)
    : 'No knowledge base available yet. Please ask the customer to provide more details about their inquiry.'
}
devLog(`[Bot Stream] ✅ RAG retrieval took: ${Date.now() - ragStartTime}ms`)
```

---

### 6. Create `src/components/settings/rag-settings.tsx`

**Purpose:** UI for configuring RAG parameters

**Component Structure:**
```tsx
'use client'

import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RagSettingsProps {
  chatBotId: string
  useQueryExpansion: boolean
  chunksPerQuery: number
  finalTopN: number
}

export function RagSettings({
  chatBotId,
  useQueryExpansion,
  chunksPerQuery,
  finalTopN,
}: RagSettingsProps) {
  const totalChunks = useQueryExpansion ? chunksPerQuery * 4 : chunksPerQuery

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="query-expansion">Enable Query Expansion</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Generates 3 alternative phrasings of each query for better
                    retrieval coverage. Improves answer quality by 30-40%.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch id="query-expansion" checked={useQueryExpansion} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Chunks per Query: {chunksPerQuery}</Label>
        <Slider
          value={[chunksPerQuery]}
          min={3}
          max={10}
          step={1}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Recommended: 5 chunks per query
        </p>
      </div>

      <div className="space-y-2">
        <Label>Final Results: {finalTopN}</Label>
        <Slider
          value={[finalTopN]}
          min={2}
          max={7}
          step={1}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Recommended: 3 results (quality over quantity)
        </p>
      </div>

      <div className="rounded-lg border p-4 bg-muted/50">
        <p className="text-sm font-medium">Pipeline Summary</p>
        <ul className="mt-2 text-sm space-y-1 text-muted-foreground">
          <li>• Queries generated: {useQueryExpansion ? '4 (1 + 3 variations)' : '1'}</li>
          <li>• Total chunks retrieved: {totalChunks}</li>
          <li>• Final results after reranking: {finalTopN}</li>
          <li>• Expected latency: ~{useQueryExpansion ? '500' : '150'}ms</li>
        </ul>
      </div>
    </div>
  )
}
```

---

### 7. Update `.env.example`

**Purpose:** Document required environment variables

**Add to `.env.example`:**
```bash
# Jina AI API Key (for reranking)
# Get your free API key at: https://jina.ai
JINA_API_KEY=jina_your_api_key_here
```

---

## Error Handling & Fallbacks

### Query Expansion Failure
```typescript
try {
  variations = await expandQuery(userQuery)
} catch (error) {
  devError('[Query Expansion] Failed, using original query only:', error)
  variations = [] // Fallback: single query mode
}
```

### Embedding Generation Failure
```typescript
const embeddings = await Promise.allSettled(
  allQueries.map(q => generateEmbedding(q))
)

// Filter out failed embeddings
const successfulEmbeddings = embeddings
  .filter(result => result.status === 'fulfilled')
  .map(result => result.value)
```

### Reranker Failure
```typescript
// Already handled in jina-reranker.ts
// Falls back to returning top N by vector similarity
```

### Complete Pipeline Failure
```typescript
try {
  return await searchKnowledgeBaseMultiQuery(...)
} catch (error) {
  devError('[Multi-Query RAG] Complete failure, using simple search:', error)
  return await searchKnowledgeBase(userQuery, domainId, 5, 0.65)
}
```

---

## Optimization Strategies

### 1. Caching

**Query Expansion Cache:**
```typescript
const expansionCache = new Map<string, string[]>()
const CACHE_TTL = 3600000 // 1 hour

function getCachedExpansion(query: string): string[] | null {
  const cached = expansionCache.get(query)
  if (cached) {
    devLog('[Cache] Query expansion cache hit')
    return cached
  }
  return null
}
```

**Embedding Cache (optional):**
- Cache embeddings for common queries
- Use Redis or in-memory LRU cache
- TTL: 1 hour

### 2. Parallel Execution

**Current Implementation:**
```typescript
// All operations run in parallel where possible
const [variations, ...] = await Promise.all([
  expandQuery(userQuery),
  // other independent operations
])
```

### 3. Request Batching

**Embedding API:**
```typescript
// OpenAI supports batch embedding
const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: allQueries // Send all 4 queries at once
})
```

### 4. Timeout Management

**Set aggressive timeouts:**
```typescript
const QUERY_EXPANSION_TIMEOUT = 3000 // 3s
const EMBEDDING_TIMEOUT = 5000 // 5s
const RERANKER_TIMEOUT = 5000 // 5s
```

---

## Testing Checklist

### Unit Tests
- [ ] Query expansion returns exactly 3 variations
- [ ] Query expansion output is valid JSON
- [ ] Embeddings are generated for all queries
- [ ] Vector searches return correct number of chunks
- [ ] Deduplication removes duplicates correctly
- [ ] Reranker returns top N chunks
- [ ] Fallbacks work when components fail

### Integration Tests
- [ ] End-to-end pipeline completes successfully
- [ ] Total latency is <600ms
- [ ] Answer quality improves vs baseline
- [ ] Error handling triggers fallbacks correctly
- [ ] Metrics are logged correctly

### Performance Tests
- [ ] Measure latency under load
- [ ] Test with 100 concurrent requests
- [ ] Verify database connection pooling
- [ ] Check memory usage with large chunks

### Quality Tests
- [ ] Compare answers with/without multi-query
- [ ] Test with ambiguous queries
- [ ] Test with multilingual queries
- [ ] Verify top 3 chunks are most relevant

---

## Monitoring & Metrics

### Key Metrics to Track

```typescript
// Log these in production
{
  queryExpansionTime: 200,
  embeddingTime: 150,
  vectorSearchTime: 100,
  deduplicationTime: 5,
  rerankingTime: 50,
  totalRagTime: 505,

  queriesGenerated: 4,
  totalChunksRetrieved: 20,
  uniqueChunks: 18,
  finalChunks: 3,

  cacheHit: false,
  fallbackTriggered: false
}
```

### Performance Targets

- ✅ Total RAG latency: <600ms
- ✅ Query expansion: <300ms
- ✅ Vector search: <150ms
- ✅ Reranking: <100ms
- ✅ Success rate: >99%

---

## Rollout Plan

### Phase 1: Implementation (Week 1)
- [ ] Implement query-expansion.ts
- [ ] Implement jina-reranker.ts
- [ ] Modify vector-search.ts
- [ ] Update database schema
- [ ] Modify API endpoint

### Phase 2: Testing (Week 2)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance testing
- [ ] Quality testing

### Phase 3: UI & Settings (Week 3)
- [ ] Build RAG settings component
- [ ] Add to dashboard
- [ ] Update documentation

### Phase 4: Monitoring & Optimization (Week 4)
- [ ] Add comprehensive logging
- [ ] Set up metrics dashboard
- [ ] Optimize based on real data
- [ ] A/B test vs current system

### Phase 5: Rollout (Week 5)
- [ ] Enable for 10% of users
- [ ] Monitor metrics
- [ ] Gradually increase to 100%

---

## Success Criteria

### Quality Metrics
- [ ] +30% improvement in answer relevance (user feedback)
- [ ] +8% hit rate (retrieves relevant chunks)
- [ ] +33% MRR (mean reciprocal rank)
- [ ] <5% error rate

### Performance Metrics
- [ ] <600ms total RAG latency (p95)
- [ ] <1% timeout rate
- [ ] >99% success rate with fallbacks

### Business Metrics
- [ ] No increase in user-reported issues
- [ ] Cost per query stays under $0.0003
- [ ] User satisfaction increases (NPS/surveys)

---

## API Keys & Configuration

### Environment Variables

```bash
# Required
JINA_API_KEY=jina_2ff455e72e4840059a18b2a4011c6d9cZFL8HSfUQZp6nxDEeW6QwE-K-K8i

# Already configured
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url
```

### Jina API Configuration

**Endpoint:** `https://api.jina.ai/v1/rerank`

**Model:** `jina-reranker-v2-base-multilingual`

**Rate Limits:** Check Jina AI dashboard for your plan

**Pricing:** Varies by plan (check https://jina.ai/pricing)

---

## References

### Documentation
- Jina Reranker API: https://jina.ai/reranker/
- Jina Query Expansion: https://github.com/jina-ai/llm-query-expansion
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
- Vercel AI SDK: https://sdk.vercel.ai/docs

### Research Papers
- Query Expansion for RAG: https://jina.ai/news/query-expansion-with-llms-searching-better-by-saying-more/
- Jina Reranker v2: https://jina.ai/news/jina-reranker-v2-for-agentic-rag-ultra-fast-multilingual-function-calling-and-code-search/

### Benchmarks
- Jina Reranker Benchmarks: https://huggingface.co/jinaai/jina-reranker-v2-base-multilingual
- RAG Evaluation: https://www.datastax.com/blog/reranker-algorithm-showdown-vector-search

---

## Contact & Support

**Implementation Lead:** [Your Name]
**Technical Review:** [Team Lead]
**Timeline:** 5 weeks
**Status:** Planning Phase

---

*Last Updated: 2025-11-01*
