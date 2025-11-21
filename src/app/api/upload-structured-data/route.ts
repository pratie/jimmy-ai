import { NextRequest, NextResponse } from 'next/server'
import { ingestStructuredData } from '@/lib/data-ingestion'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File
        const domainId = formData.get('domainId') as string

        if (!file || !domainId) {
            return NextResponse.json({ error: 'Missing file or domainId' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await ingestStructuredData(buffer, file.name, file.type, domainId)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
