/**
 * Read-only retrieval check. Runs the real vector search the widget runs.
 *
 *   node --env-file=.env.local scripts/verify-retrieval.mjs
 *
 * Embeds a question with the same model the ingestion pipeline uses and calls
 * `match_knowledge_chunks_scoped` with the workspace's own assistant id — the
 * exact scope `/api/bot/stream` passes. If this returns nothing, the assistant
 * is answering from an empty knowledge base.
 *
 * Issues no INSERT, UPDATE, DELETE or DDL. Costs a few embedding tokens.
 */

import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CASES = [
  { workspaceId: 'be8710f0-4f53-481d-834f-5fe7aa766120', query: 'what does the app do' },
  { workspaceId: '7ed632a5-413b-4a11-982b-63773d669d5e', query: 'how much does it cost — pricing and plans' },
]

async function embed(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.replaceAll('\n', ' ').trim(),
    encoding_format: 'float',
  })
  return response.data[0].embedding
}

async function search(workspaceId, assistantId, embedding, limit = 5, threshold = 0.3) {
  return prisma.$queryRawUnsafe(
    `SELECT * FROM match_knowledge_chunks_scoped($1::uuid, $2::vector, $3::int, $4::float, $5::uuid, $6::int)`,
    workspaceId,
    `[${embedding.join(',')}]`,
    limit,
    threshold,
    assistantId,
    1
  )
}

async function main() {
  for (const testCase of CASES) {
    const workspace = await prisma.clientWorkspace.findUnique({
      where: { id: testCase.workspaceId },
      select: {
        name: true,
        assistants: {
          where: { deletedAt: null },
          select: { id: true, knowledgeSourceLinks: { where: { enabled: true }, select: { id: true } } },
        },
      },
    })
    const assistant = workspace?.assistants[0]
    console.log(`\n=== ${workspace?.name} — "${testCase.query}"`)
    console.log(`assistant=${assistant?.id} enabledLinks=${assistant?.knowledgeSourceLinks.length}`)

    const embedding = await embed(testCase.query)

    const scoped = await search(testCase.workspaceId, assistant.id, embedding)
    console.log(`scoped to assistant → ${scoped.length} chunk(s)`)
    for (const row of scoped) {
      console.log(
        `  ${Number(row.similarity).toFixed(3)}  ${row.canonicalUrl ?? '—'}  ` +
          `${row.content.replace(/\s+/g, ' ').slice(0, 110)}…`
      )
    }

    const wide = await search(testCase.workspaceId, null, embedding)
    console.log(`workspace-wide fallback → ${wide.length} chunk(s)`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
