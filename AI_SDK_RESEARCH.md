# Vercel AI SDK Research & Analysis

## Branch: `feature/vercel-ai-sdk-testing`

---

## 📋 Executive Summary

**Current Status:** BookmyLead AI currently uses:
- ✅ OpenAI SDK (`openai@4.47.1`) with manual streaming implementation
- ✅ Basic AI SDK (`ai@4.3.19`) - older version
- ✅ OpenAI provider (`@ai-sdk/openai@1.3.24`)

**Recommendation:** Upgrade to **Vercel AI SDK 5** for improved performance, better DX, and modern features.

---

## 🔍 Current Implementation Analysis

### Tech Stack
- **Next.js:** 15.5.4 (App Router)
- **React:** 18
- **AI Libraries:**
  - `openai`: 4.47.1
  - `ai`: 4.3.19 (Vercel AI SDK v4)
  - `@ai-sdk/openai`: 1.3.24

### Current Streaming Implementation (`src/app/api/bot/stream/route.ts`)

**Approach:** Manual streaming with OpenAI SDK
```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  stream: true,
})

// Manual ReadableStream handling
const readableStream = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
    }
  }
})
```

**Issues with Current Approach:**
1. ❌ Manual SSE (Server-Sent Events) formatting
2. ❌ No built-in error handling
3. ❌ Manual message storage logic
4. ❌ No UI hooks integration
5. ❌ Verbose boilerplate code

---

## 🚀 Vercel AI SDK 5 Features

### What's New in AI SDK 5

#### 1. **AI SDK Core**
- Unified API for text generation, structured objects, tool calls, and agents
- Provider-agnostic (OpenAI, Anthropic, Google, xAI, Azure, etc.)
- Built-in streaming support
- Automatic error handling
- Tool/function calling support

#### 2. **AI SDK UI**
- Framework-specific hooks for React, Vue, Svelte, Angular
- `useChat()` hook for chat interfaces
- `useCompletion()` hook for text completion
- `useAssistant()` hook for OpenAI Assistants
- Automatic message management
- Built-in loading states and error handling

#### 3. **Key Improvements Over V4**
- ✅ Complete framework parity (React, Vue, Svelte, Angular)
- ✅ Rebuilt chat with world-class UI integration
- ✅ End-to-end type safety
- ✅ Better streaming performance
- ✅ Simplified API surface

---

## 🎯 Benefits of Upgrading

### 1. **Simplified Streaming**
**Before (Current):**
```typescript
// 50+ lines of manual stream handling
const readableStream = new ReadableStream({...})
```

**After (AI SDK 5):**
```typescript
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: systemPrompt,
  })

  return result.toDataStreamResponse()
}
```
**Reduction:** 50+ lines → ~10 lines

### 2. **Built-in Frontend Hooks**
**Before (Current):**
```typescript
// Manual fetch, state management, streaming handling
const [messages, setMessages] = useState([])
const [isLoading, setIsLoading] = useState(false)
// ... 100+ lines of custom logic
```

**After (AI SDK 5):**
```typescript
import { useChat } from 'ai/react'

export function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/bot/stream',
  })

  return (
    <form onSubmit={handleSubmit}>
      {messages.map(m => <div key={m.id}>{m.content}</div>)}
      <input value={input} onChange={handleInputChange} />
    </form>
  )
}
```
**Reduction:** 100+ lines → ~15 lines

### 3. **Advanced Features**
- ✅ Tool/Function calling built-in
- ✅ Structured data generation with Zod schemas
- ✅ Multi-modal support (text, images, audio)
- ✅ Agent workflows
- ✅ Automatic retry logic
- ✅ Better token counting

---

## 📦 Installation Plan

### Step 1: Update Dependencies
```bash
npm install ai@latest @ai-sdk/openai@latest
```

**Expected versions:**
- `ai`: ~5.x.x (currently 4.3.19)
- `@ai-sdk/openai`: ~latest (currently 1.3.24)

### Step 2: Keep Existing Dependencies
```bash
# Keep these (still useful):
# - openai@4.47.1 (for embeddings, fine-tuning, etc.)
# - @langchain/textsplitters (for RAG)
```

---

## 🔧 Migration Strategy

### Phase 1: Backend API Routes (Low Risk)
**Target:** `src/app/api/bot/stream/route.ts`

1. ✅ Keep existing logic (RAG, caching, credit checks)
2. ✅ Replace OpenAI streaming with AI SDK `streamText()`
3. ✅ Test with current frontend (should work seamlessly)

**Estimated time:** 2-3 hours
**Risk:** Low (drop-in replacement)

### Phase 2: Frontend Hooks (Medium Risk)
**Target:** Chat components

1. ✅ Migrate to `useChat()` hook
2. ✅ Remove manual state management
3. ✅ Test message persistence
4. ✅ Test real-time updates (Pusher integration)

**Estimated time:** 4-6 hours
**Risk:** Medium (needs testing with Pusher)

### Phase 3: Advanced Features (Optional)
1. ✅ Add tool calling for appointment booking
2. ✅ Add structured data extraction (customer info)
3. ✅ Implement agent workflows

**Estimated time:** 8-12 hours
**Risk:** Low (additive features)

---

## ⚖️ Compatibility Matrix

| Component | Next.js 15.5.4 | AI SDK 5 | Status |
|-----------|----------------|----------|--------|
| App Router | ✅ | ✅ | Compatible |
| Server Actions | ✅ | ✅ | Compatible |
| Streaming | ✅ | ✅ | Compatible |
| React 18 | ✅ | ✅ | Compatible |
| TypeScript 5 | ✅ | ✅ | Compatible |

**Conclusion:** ✅ Fully compatible with your stack

---

## 🎬 Quick Start Example

### Backend (`src/app/api/chat/route.ts`)
```typescript
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: 'You are a helpful AI assistant.',
  })

  return result.toDataStreamResponse()
}
```

### Frontend (`components/chat.tsx`)
```typescript
'use client'
import { useChat } from 'ai/react'

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
```

---

## 📚 Resources

- **Documentation:** https://ai-sdk.dev/docs
- **GitHub:** https://github.com/vercel/ai
- **Examples:** https://vercel.com/templates?search=ai
- **Blog:** https://vercel.com/blog/ai-sdk-5

---

## ✅ Next Steps

1. ✅ **Branch created:** `feature/vercel-ai-sdk-testing`
2. ⏳ **Install AI SDK 5:** `npm install ai@latest @ai-sdk/openai@latest`
3. ⏳ **Create test endpoint:** Simple chat route with `streamText()`
4. ⏳ **Test frontend:** Verify `useChat()` hook works
5. ⏳ **Migrate existing routes:** One route at a time
6. ⏳ **Performance testing:** Compare old vs new implementation
7. ⏳ **Merge to main:** After thorough testing

---

## 🚨 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking changes in V5 | High | Test in isolated branch first |
| Pusher real-time conflicts | Medium | Keep existing Pusher logic separate |
| Message persistence changes | Medium | Test database writes thoroughly |
| Performance regression | Low | Benchmark before/after |

---

## 💡 Recommendations

### ✅ DO
- Upgrade to AI SDK 5 for better DX and features
- Start with simple test endpoint
- Keep existing RAG, caching, credit logic
- Use `useChat()` hook for new components

### ❌ DON'T
- Don't migrate all routes at once (incremental approach)
- Don't remove OpenAI SDK (still needed for embeddings)
- Don't skip testing with real users
- Don't forget to update TypeScript types

---

**Created:** 2025-01-11
**Branch:** `feature/vercel-ai-sdk-testing`
**Author:** Claude Code
**Status:** Ready for implementation 🚀
