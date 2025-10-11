'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ClaudeTest() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/chat-claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }]
        })
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value)
          setResponse(prev => prev + text)
        }
      }
    } catch (err: any) {
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Claude (Anthropic) Test - AI SDK 5
          </CardTitle>
          <CardDescription>
            Testing Vercel AI SDK 5 with Claude 3.5 Sonnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Claude something..."
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Claude is thinking...' : 'Send to Claude'}
            </Button>
          </form>

          {response && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-xs font-semibold mb-2 text-muted-foreground">
                Claude 3.5 Sonnet:
              </div>
              <pre className="whitespace-pre-wrap text-sm">{response}</pre>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>✅ AI SDK Version: 5.0.68</p>
            <p>✅ Anthropic Provider: 2.0.27</p>
            <p>✅ Model: claude-3-5-sonnet-20241022</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
