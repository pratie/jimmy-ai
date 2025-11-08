"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type QueryResult = {
  success: boolean
  text?: string
  sources?: any
  providerMetadata?: any
  error?: string
}

const ClientPreview: React.FC = () => {
  const searchParams = useSearchParams()

  const [storeName, setStoreName] = useState('')
  const [prompt, setPrompt] = useState('')
  const modelId = 'gemini-2.5-flash'
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)

  useEffect(() => {
    const preset = searchParams?.get('store') || ''
    if (preset) setStoreName(preset)
  }, [searchParams])

  const onRunQuery = async () => {
    setRunning(true)
    setResult(null)
    try {
      const res = await fetch('/api/experiments/gemini-file-search/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          storeNames: storeName ? [storeName] : [],
          modelId,
        }),
      })
      const data = (await res.json()) as QueryResult
      setResult(data)
    } catch (e: any) {
      setResult({ success: false, error: e?.message || String(e) })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="w-full max-w-[980px] space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Gemini File Search — Live Preview (Experimental)</h1>
          <p className="text-sm text-muted-foreground">
            Query a Gemini File Search store. To create a store or upload files, go to the Experiments page.
          </p>
        </div>
        <Button asChild size="sm" variant="reverse">
          <a href="https://chatdock.io" target="_blank" rel="noopener noreferrer">
            Upload your own file
          </a>
        </Button>
      </div>

      {!storeName && (
        <div className="text-sm text-red-600">
          Missing store id in URL (?store=...). Open this page from the Experiments flow after creating a store.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Query with File Search Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Suggested questions</div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setPrompt("Which startup has the highest MRR?")}
              >
                Highest MRR startup
              </Button>
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setPrompt("Which startup has the highest revenue?")}
              >
                Highest revenue startup
              </Button>
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setPrompt("What are the top 3 startups in the 'Services' category based on their 30-day revenue?")}
              >
                Top 3 in Services (30d revenue)
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prompt</label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="h-28" />
          </div>

          <div>
            <Button onClick={onRunQuery} disabled={running || !storeName}>
              {running ? 'Running…' : 'Run Query'}
            </Button>
          </div>

          {result && (
            <div className="text-sm">
              {!result.success && (
                <div className="text-red-600">{result.error || 'Query failed'}</div>
              )}
              {result.success && (
                <div className="space-y-2">
                  <div>
                    <div className="font-semibold mb-1">Response</div>
                    <div className="whitespace-pre-wrap p-2 border rounded bg-gray-50">{result.text}</div>
                  </div>
                  {result.sources && (
                    <details>
                      <summary className="cursor-pointer">Sources</summary>
                      <pre className="p-2 border rounded bg-gray-50 overflow-auto">{JSON.stringify(result.sources, null, 2)}</pre>
                    </details>
                  )}
                  {result.providerMetadata && (
                    <details>
                      <summary className="cursor-pointer">Provider Metadata</summary>
                      <pre className="p-2 border rounded bg-gray-50 overflow-auto">{JSON.stringify(result.providerMetadata, null, 2)}</pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientPreview
