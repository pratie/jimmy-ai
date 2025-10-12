// Server-side proxy for KIE API uploads
// This protects the KIE_API_KEY from being exposed to clients

import { NextRequest, NextResponse } from 'next/server'
import { devError } from '@/lib/utils'

const KIE_API_BASE_URL = 'https://kieai.redpandaai.co'

// Get KIE API key from server-only environment variable
const getKieApiKey = (): string => {
  const apiKey = process.env.KIE_API_KEY
  if (!apiKey) {
    throw new Error('KIE_API_KEY is not configured in server environment variables')
  }
  return apiKey
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { base64Data, uploadPath, fileName } = body

    // Validate request
    if (!base64Data || !fileName) {
      return NextResponse.json(
        { success: false, msg: 'Missing required fields: base64Data, fileName' },
        { status: 400 }
      )
    }

    // Proxy request to KIE API
    const response = await fetch(`${KIE_API_BASE_URL}/api/file-base64-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getKieApiKey()}`,
      },
      body: JSON.stringify({
        base64Data,
        uploadPath: uploadPath || 'images/chatbot',
        fileName,
      }),
    })

    const result = await response.json()

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
      })
    } else {
      return NextResponse.json(
        { success: false, msg: result.msg || 'Upload failed' },
        { status: response.status }
      )
    }
  } catch (error) {
    devError('[Upload API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        msg: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
