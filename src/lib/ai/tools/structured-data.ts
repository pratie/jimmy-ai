import { tool } from 'ai'
import { z } from 'zod'
import { client as prisma } from '@/lib/prisma'

export const createGetDatasetsTool = (domainId: string) => tool({
  description: 'Get a list of available structured datasets (spreadsheets) for this domain.',
  parameters: z.object({}),
  execute: async () => {
    console.log(`[Agent Tool] 🛠️  Calling getDatasets for domain: ${domainId}`)
    try {
      const datasets = await prisma.recordManager.findMany({
        where: {
          domainId: domainId,
          type: 'tabular',
        },
        select: {
          id: true,
          title: true,
          schema: true,
          createdAt: true,
        },
      })
      console.log(`[Agent Tool] ✅ getDatasets found ${datasets.length} datasets`)
      return datasets
    } catch (error) {
      console.error('[Agent Tool] ❌ getDatasets failed:', error)
      return { error: 'Failed to fetch datasets' }
    }
  },
})

export const createQueryTabularDataTool = (domainId: string) => tool({
  description: 'Execute a SQL query on a specific tabular dataset. IMPORTANT: You MUST provide both recordManagerId (from getDatasets result) and the SQL query. The table name is "TabularData" and data is in JSONB column "rowData". Use Postgres JSON operators (->>) to extract values. Example: SELECT rowData->>\'Name\' as name FROM "TabularData" WHERE "recordManagerId" = \'the-id-from-getDatasets\'',
  parameters: z.object({
    recordManagerId: z.string().describe('REQUIRED: The ID of the dataset from getDatasets result. This must be provided.'),
    query: z.string().describe('The SQL query to execute. Must be a SELECT statement querying "TabularData" table and must include WHERE "recordManagerId" = \'...\' clause.'),
  }),
  execute: async ({ recordManagerId, query }: { recordManagerId: string; query: string }) => {
    console.log(`[Agent Tool] 🛠️  Calling queryTabularData`)
    console.log(`[Agent Tool] 📝 Query: ${query}`)
    console.log(`[Agent Tool] 🆔 RecordManagerId: ${recordManagerId}`)

    try {
      // Verify recordManager belongs to this domain
      const recordManager = await prisma.recordManager.findUnique({
        where: { id: recordManagerId },
        select: { domainId: true }
      })

      if (!recordManager || recordManager.domainId !== domainId) {
        console.error('[Agent Tool] ❌ Security check failed: RecordManager does not belong to domain')
        return { error: 'Access denied: Dataset not found or does not belong to this domain.' }
      }

      // Basic security checks
      const lowerQuery = query.toLowerCase().trim()
      if (!lowerQuery.startsWith('select')) {
        return { error: 'Only SELECT queries are allowed.' }
      }
      if (lowerQuery.includes('drop') || lowerQuery.includes('delete') || lowerQuery.includes('update') || lowerQuery.includes('insert') || lowerQuery.includes('alter')) {
        return { error: 'Mutating queries are not allowed.' }
      }

      // CRITICAL: Ensure the query actually filters by recordManagerId to avoid scanning the whole table
      if (!query.includes(recordManagerId)) {
        return { error: 'Security Error: You MUST include the "recordManagerId" in your WHERE clause.' }
      }

      const results = await prisma.$queryRawUnsafe(query)
      console.log(`[Agent Tool] ✅ Query executed successfully. Rows: ${Array.isArray(results) ? results.length : 0}`)

      // Convert BigInt to string for JSON serialization if necessary
      const serializedResult = JSON.parse(JSON.stringify(results, (key, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value
      ))

      return serializedResult
    } catch (error) {
      console.error('[Agent Tool] ❌ Query execution failed:', error)
      return { error: `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
