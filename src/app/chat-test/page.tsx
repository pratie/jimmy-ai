'use client'

import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Send } from 'lucide-react'

export default function ChatTestPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat-test',
  })

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 AI SDK 5 Test
          </CardTitle>
          <CardDescription>
            Testing Vercel AI SDK 5 with useChat() hook and streamText()
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages Display */}
          <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto p-4 bg-muted/20 rounded-lg border">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <p className="mb-2">👋 Start a conversation!</p>
                <p className="text-sm">This is using AI SDK 5&apos;s useChat() hook</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {message.role === 'user' ? 'You' : 'AI'}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Stats */}
          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>✅ AI SDK Version: 5.0.68</p>
            <p>✅ OpenAI Provider: 2.0.49</p>
            <p>✅ Model: gpt-4o-mini</p>
            <p>✅ Messages: {messages.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
