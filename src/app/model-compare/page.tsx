'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

type Model = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-3.5-turbo'

const modelInfo = {
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    cost: '$0.15/1M input tokens',
    speed: '~100 tok/s',
    useCase: 'Fast, cheap - perfect for simple queries',
  },
  'gpt-4o': {
    name: 'GPT-4o',
    cost: '$2.50/1M input tokens',
    speed: '~80 tok/s',
    useCase: 'High quality - best for complex tasks',
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    cost: '$0.50/1M input tokens',
    speed: '~120 tok/s',
    useCase: 'Balanced - good speed and cost',
  },
}

export default function ModelComparePage() {
  const [model, setModel] = useState<Model>('gpt-4o-mini')
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponse('')

    const startTime = Date.now()

    try {
      const res = await fetch('/api/model-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
          model,
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

      setTime(Date.now() - startTime)
    } catch (err: any) {
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🎯 AI SDK 5: Model Comparison Demo</CardTitle>
          <CardDescription>
            See how easy it is to switch between AI models with just one line of code!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select AI Model</label>
            <Select value={model} onValueChange={(v) => setModel(v as Model)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(modelInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.name} - {info.cost}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p><strong>Cost:</strong> {modelInfo[model].cost}</p>
              <p><strong>Speed:</strong> {modelInfo[model].speed}</p>
              <p><strong>Best for:</strong> {modelInfo[model].useCase}</p>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Question</label>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Write a tagline for an AI-powered lead generation tool"
                disabled={loading}
                className="text-base"
              />
            </div>
            <Button type="submit" disabled={loading || !input.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Generating with {modelInfo[model].name}...
                </>
              ) : (
                `Generate with ${modelInfo[model].name}`
              )}
            </Button>
          </form>

          {/* Response */}
          {response && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Response</label>
                {time > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ⚡ Generated in {(time / 1000).toFixed(2)}s
                  </span>
                )}
              </div>
              <div className="p-4 bg-muted rounded-lg border">
                <p className="whitespace-pre-wrap text-sm">{response}</p>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="pt-4 border-t space-y-2">
            <h3 className="text-sm font-semibold">✨ Key Benefits:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✅ Switch models in the API with <strong>1 line of code</strong></li>
              <li>✅ No changes needed in frontend - same streaming interface</li>
              <li>✅ Route users to different models based on their tier (Free/Pro/Enterprise)</li>
              <li>✅ Add fallbacks: try GPT-4o-mini first, use GPT-4o if needed</li>
              <li>✅ Test different models side-by-side for your use case</li>
              <li>✅ Save 40-60% on AI costs with smart routing</li>
            </ul>
          </div>

          {/* Code Example */}
          <div className="pt-4 border-t space-y-2">
            <h3 className="text-sm font-semibold">📝 The Code (API Route):</h3>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`// Just change the model parameter!
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

const result = streamText({
  model: openai('${model}'), // ← That's it!
  messages,
  system: 'You are a helpful assistant.',
})

return result.toTextStreamResponse()`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
