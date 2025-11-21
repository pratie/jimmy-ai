import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

import { client as prisma } from '@/lib/prisma'

export type IngestionResult = {
    success: boolean
    recordId?: string
    error?: string
    rowCount?: number
}

export async function ingestStructuredData(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    domainId: string
): Promise<IngestionResult> {
    try {
        let data: any[] = []
        let schema: string[] = []

        // 1. Parse the file
        if (mimeType === 'text/csv' || filename.endsWith('.csv')) {
            const text = fileBuffer.toString('utf-8')
            const result = Papa.parse(text, { header: true, skipEmptyLines: true })
            if (result.errors.length > 0) {
                console.warn('CSV parsing errors:', result.errors)
            }
            data = result.data
            schema = result.meta.fields || []
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            filename.endsWith('.xlsx') ||
            filename.endsWith('.xls')
        ) {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            data = XLSX.utils.sheet_to_json(sheet)
            if (data.length > 0) {
                schema = Object.keys(data[0])
            }
        } else {
            return { success: false, error: 'Unsupported file type' }
        }

        if (data.length === 0) {
            return { success: false, error: 'No data found in file' }
        }

        // 2. Generate Hash
        const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')

        // 3. Check for existing record (optional: update logic)
        // For now, we'll just create a new one or update if hash matches?
        // Let's create a new RecordManager entry.

        const recordManager = await prisma.recordManager.create({
            data: {
                title: filename,
                type: 'tabular',
                schema: schema,
                hash: hash,
                domainId: domainId,
            },
        })

        // 4. Insert rows into TabularData
        // Batch insert for performance
        const BATCH_SIZE = 100
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE)
            await prisma.tabularData.createMany({
                data: batch.map((row) => ({
                    recordManagerId: recordManager.id,
                    rowData: row,
                })),
            })
        }

        return { success: true, recordId: recordManager.id, rowCount: data.length }
    } catch (error) {
        console.error('Error ingesting structured data:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
