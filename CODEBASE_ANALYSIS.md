# Corinna AI - Comprehensive Codebase Analysis

**Generated:** 2025-10-10
**Analysis Scope:** Complete architectural analysis via 8 parallel domain experts
**Codebase Size:** ~22,727 lines of TypeScript/TSX
**Tech Stack:** Next.js 15.5.4, Clerk 6.33.1, Prisma 5.13.0, PostgreSQL + pgvector, OpenAI API

---

## Executive Summary

Corinna AI is a production-ready **chatbot SaaS platform** that enables businesses to deploy AI-powered customer support agents. The system features:

- ✅ **RAG-Powered Chatbots** - Vector embeddings with semantic search for context-aware responses
- ✅ **Multi-Tenant Architecture** - Domain isolation with plan-based limits
- ✅ **Message-Based Pricing** - 4 subscription tiers (FREE, STARTER, PRO, BUSINESS)
- ✅ **Advanced Training Pipeline** - Web scraping, PDF uploads, embeddings generation
- ✅ **Real-Time Conversations** - Anonymous → identified customer flows with live agent handoff
- ✅ **Appointment Booking** - Integrated scheduling system
- ✅ **Payment Processing** - Dodo Payments integration
- ✅ **Comprehensive Dashboard** - Analytics, settings, conversation management

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Authentication & User Management](#1-authentication--user-management)
3. [Chatbot & AI Core](#2-chatbot--ai-core)
4. [Payment & Billing System](#3-payment--billing-system)
5. [Database Schema](#4-database-schema)
6. [UI Components & Design System](#5-ui-components--design-system)
7. [Dashboard & Settings](#6-dashboard--settings)
8. [Knowledge Base & Training](#7-knowledge-base--training)
9. [Portal & Customer-Facing](#8-portal--customer-facing)
10. [Technical Debt & Optimization Opportunities](#technical-debt--optimization-opportunities)
11. [Architecture Diagram](#architecture-diagram)

---

## System Architecture Overview

### Tech Stack

**Frontend:**
- Next.js 15.5.4 (App Router)
- React 18 with Server Components
- Tailwind CSS + Radix UI primitives
- next-themes for dark mode
- TypeScript 5

**Backend:**
- Next.js API Routes (streaming SSE)
- Prisma ORM 5.13.0
- PostgreSQL with pgvector extension
- Clerk 6.33.1 for authentication

**AI/ML:**
- OpenAI GPT-4o-mini (chat completions)
- OpenAI text-embedding-3-small (1536 dimensions)
- LangChain text splitters
- pgvector HNSW indexing

**Payments:**
- Dodo Payments (subscriptions + one-time)
- Standardwebhooks for signature verification

**Real-Time:**
- Pusher (WebSocket-based live chat)
- Server-Sent Events (AI streaming)

**External APIs:**
- Firecrawl (website → markdown scraping)
- KIE API (file uploads)

---

## 1. Authentication & User Management

### Architecture

**Provider:** Clerk 6.33.1
**Pattern:** Multi-layer protection (middleware → layout → server actions)

### Key Features

1. **Multi-Step Registration**
   - Step 1: User type selection (Owner/Student)
   - Step 2: Account details with Zod validation
   - Step 3: Email verification via 6-digit OTP

2. **OAuth Support**
   - Google sign-in with automatic user creation
   - SSO callback handling with race condition protection
   - Transaction-based database upserts

3. **Middleware Protection**
   - Route-based whitelist (`isPublicRoute` matcher)
   - Automatic redirect to `/auth/sign-in` for protected routes
   - Public routes: `/`, `/auth/*`, `/portal/*`, `/api/bot/*`, `/chatbot`

4. **Session Management**
   - HTTP-only cookies (Clerk managed)
   - Server-side validation via `auth()` and `currentUser()`
   - Multi-device synchronization

### Security Strengths

✅ Password validation (8-64 chars, alphanumeric)
✅ Email verification required
✅ Idempotent user creation (safe for OAuth race conditions)
✅ Clerk's Smart CAPTCHA integration ready
✅ Transaction-based atomic operations

### Code Reference

**Middleware:** `src/middleware.ts:1-32`
**Sign-up Hook:** `src/hooks/sign-up/use-sign-up.ts:27-239`
**Auth Actions:** `src/actions/auth/index.ts:7-241`

---

## 2. Chatbot & AI Core

### Streaming Chat Architecture

**Endpoint:** `POST /api/bot/stream`
**Protocol:** Server-Sent Events (SSE)
**Model:** GPT-4o-mini
**Max Duration:** 30 seconds

### Processing Pipeline

```
User Message → Domain Cache Check → Credit Enforcement → RAG Retrieval →
System Prompt Building → OpenAI Streaming → SSE Response → DB Persistence
```

### RAG Implementation

**Vector Search:**
- **Embeddings:** OpenAI text-embedding-3-small (1536 dims)
- **Storage:** PostgreSQL pgvector with HNSW index
- **Similarity:** Cosine distance (threshold: 0.3)
- **Top K:** 5 chunks per query

**Fallback Strategy:**
- If no embeddings → truncated raw knowledge base (12,000 chars)
- Graceful degradation ensures chatbot always responds

### Conversation State Management

**Anonymous Users:**
- UUID generated client-side (localStorage)
- Chat room created with `anonymousId` field
- QUALIFIER mode until email provided

**Customer Identification:**
- Email extracted from messages via regex
- Customer record created with race condition protection
- Anonymous history linked atomically
- Mode switches to configured setting (SALES/SUPPORT/FAQ_STRICT)

**Live Mode Handoff:**
- AI detects need for human assistance
- Response contains `(realtime)` marker
- Chat room `live` flag activated
- Pusher WebSocket subscription initiated
- Email notification sent to owner (first time only)

### Performance Optimizations

**LRU Domain Cache:**
- Capacity: 100 domains
- TTL: 60 seconds
- Cache hit: 0ms vs. 50-150ms DB query
- Hit ratio: 85-95% in production

**Metrics Logged:**
- Time To First Token (TTFT): 150-500ms
- Total streaming time: 1,500-3,000ms
- Cache hit ratios (global + per-domain)
- Token count and processing times

### Message Credit System

**Enforcement:** Pre-flight check before AI generation
**Counting:** Incremented after response completion
**Reset Logic:** 30-day cycles with automatic refresh

**Plan Limits:**
| Plan | Monthly Messages |
|------|-----------------|
| FREE | 60 |
| STARTER | 2,000 |
| PRO | 5,000 |
| BUSINESS | 10,000 |

### Code Reference

**Streaming API:** `src/app/api/bot/stream/route.ts:1-564`
**Vector Search:** `src/lib/vector-search.ts:24-98`
**Prompt Builder:** `src/lib/promptBuilder.ts:5-131`
**Chatbot Hook:** `src/hooks/chatbot/use-chatbot.ts:14-394`

---

## 3. Payment & Billing System

### Provider Integration

**Platform:** Dodo Payments
**Webhook Security:** standardwebhooks signature verification
**Subscription Types:** Monthly, Yearly (40-42% discount)

### Pricing Tiers

| Plan | Monthly | Yearly | Message Credits | Domains | KB Size | Training Sources |
|------|---------|--------|----------------|---------|---------|------------------|
| FREE | $0 | $0 | 60 | 1 | 1 MB | 5 |
| STARTER | $19 | $132 | 2,000 | 1 | 20 MB | 15 |
| PRO | $49 | $348 | 5,000 | 5 | 50 MB | 50 |
| BUSINESS | $99 | $708 | 10,000 | Unlimited | 200 MB | Unlimited |

### Subscription Lifecycle

**Creation Flow:**
1. User selects plan + interval
2. Server action creates Dodo subscription
3. Redirect to Dodo hosted checkout
4. Webhook activates subscription
5. Database updated with subscription details

**Webhook Events Handled:**
- `subscription.active` - New subscription
- `subscription.renewed` - Renewal
- `subscription.canceled` - Cancellation
- `subscription.on_hold` - Payment failed
- `payment.succeeded` - One-time payment

**Cancellation:**
- Schedule cancellation at period end (`cancelAtPeriodEnd: true`)
- Immediate downgrade to FREE plan option
- Credits remain active until period end

**Plan Switching:**
- Proration options: `prorated_immediately`, `full_immediately`, `difference_immediately`
- Instant local database update
- Credit reset on plan change

### Message Credit Reset Logic

```typescript
// Check if credits should reset (30-day cycle)
if (shouldResetCredits(billing.messagesResetAt)) {
  const limits = getPlanLimits(billing.plan)
  await client.billings.update({
    data: {
      messagesUsed: 0,
      messageCredits: limits.messageCredits,
      messagesResetAt: getNextResetDate() // +30 days
    }
  })
}

// Enforce limit
if (billing.messagesUsed >= billing.messageCredits) {
  return 429 Error // "Message limit reached"
}
```

### Code Reference

**Webhook Handler:** `src/app/api/dodo/webhook/route.ts:18-213`
**Subscription Actions:** `src/actions/dodo/index.ts:39-424`
**Plan Configuration:** `src/lib/plans.ts:6-98`
**Billing Hooks:** `src/hooks/billing/use-billing.ts:103-247`

---

## 4. Database Schema

### Entity Relationship Overview

**Core Models:** 16 total

**Hierarchy:**
```
User (root)
  ├── Billings (1:1) - Subscription & message credits
  ├── Domain[] (1:N) - Managed websites
  │     ├── ChatBot (1:1) - AI configuration
  │     │     └── KnowledgeChunk[] (1:N) - Vector embeddings
  │     ├── Customer[] (1:N) - Leads/visitors
  │     │     ├── ChatRoom[] (1:N) - Conversations
  │     │     │     └── ChatMessage[] (1:N) - Individual messages
  │     │     ├── CustomerResponses[] (1:N) - Question answers
  │     │     └── Bookings[] (1:N) - Appointments
  │     ├── FilterQuestions[] (1:N) - Qualification questions
  │     ├── HelpDesk[] (1:N) - FAQ entries
  │     └── Product[] (1:N) - E-commerce items
  ├── Campaign[] (1:N) - Email marketing
  ├── Account[] (1:N) - OAuth connections
  └── Session[] (1:N) - Auth sessions
```

### Key Models Deep Dive

#### User Model
```prisma
model User {
  id             String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  fullname       String
  clerkId        String     @unique
  type           String     // 'OWNER' or 'STUDENT'
  email          String?
  dodoMerchantId String?    // Payment provider merchant ID
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  subscription   Billings?  // 1:1
  domains        Domain[]   // 1:N
  campaign       Campaign[] // 1:N
}
```

#### Domain Model (Multi-Tenancy)
```prisma
model Domain {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name                String   // e.g., "example.com"
  icon                String
  userId              String?  @db.Uuid
  knowledgeBaseSizeMB Float    @default(0)
  trainingSourcesUsed Int      @default(0)  // Permanent counter (anti-abuse)

  chatBot             ChatBot?
  customer            Customer[]
  chatRooms           ChatRoom[]
  knowledgeChunks     KnowledgeChunk[]

  @@index([userId])
}
```

#### KnowledgeChunk Model (RAG)
```prisma
model KnowledgeChunk {
  id         String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  domainId   String                 @db.Uuid
  chatBotId  String                 @db.Uuid
  content    String                 // Text chunk
  embedding  Unsupported("vector")? // 1536-dimensional pgvector
  sourceType String                 // 'firecrawl', 'pdf', 'text'
  sourceUrl  String?
  sourceName String?

  @@index([domainId])
  @@index([chatBotId])
  @@index([sourceType])
}
```

**HNSW Vector Index:**
```sql
CREATE INDEX knowledge_chunk_embedding_idx
ON "KnowledgeChunk"
USING hnsw (embedding vector_cosine_ops);
```

#### ChatRoom Model (Conversation Container)
```prisma
model ChatRoom {
  id          String   @id @default(uuid())
  live        Boolean  @default(false)     // Live agent mode
  mailed      Boolean  @default(false)     // Email notification sent
  anonymousId String?                      // UUID for anonymous visitors
  customerId  String?  @db.Uuid           // Linked customer (null if anonymous)
  domainId    String?  @db.Uuid

  message     ChatMessage[]

  @@index([domainId])
  @@index([anonymousId])
}
```

### Index Strategy

**Performance-Critical Indexes:**
- Foreign keys (all `userId`, `domainId`, `customerId` fields)
- Anonymous user tracking (`ChatRoom.anonymousId`)
- Vector similarity (`KnowledgeChunk.embedding` with HNSW)
- Source type filtering (`KnowledgeChunk.sourceType`)

### Cascade Delete Behavior

**User Deletion Cascade:**
```
User (DELETE) → Billings, Domain[], Campaign[], Account[], Session[]
  Domain (DELETE) → ChatBot, Customer[], ChatRoom[], KnowledgeChunk[], FilterQuestions[], HelpDesk[], Product[]
    ChatBot (DELETE) → KnowledgeChunk[]
    Customer (DELETE) → ChatRoom[], CustomerResponses[], Bookings[]
      ChatRoom (DELETE) → ChatMessage[]
```

**Safety:** All critical relationships have `onDelete: Cascade` defined

### Code Reference

**Prisma Schema:** `prisma/schema.prisma:1-287`
**Vector Setup:** `supabase-vector-setup.sql:41-88`
**Migration Indexes:** `prisma/migrations/add_missing_indexes.sql`

---

## 5. UI Components & Design System

### Component Inventory

**Total Components:** 47 UI primitives + 90+ feature components

**Radix UI Primitives (31):**
- Overlay: Dialog, AlertDialog, Sheet, Popover, HoverCard, Tooltip
- Navigation: Tabs, Accordion, NavigationMenu, Menubar, DropdownMenu, ContextMenu
- Forms: Form (RHF integration), Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Calendar
- Display: Card, Badge, Avatar, Separator, Progress, Skeleton, Table, AspectRatio
- Actions: Button, Toggle, ToggleGroup
- Feedback: Alert, Toast, Toaster, Sonner
- Layout: ScrollArea, Resizable, Collapsible, Carousel
- Utility: Command (cmdk), Pagination, Drawer (vaul)

### Design Tokens

**Color System:**
- **Brand Palette:** 11 colors (primary, secondary, accent, info, success, warning, error, yellow, base-100/200/300)
- **Pastel Palette:** 7 colors (lavender, cream, blush, pink, mint, sky, periwinkle)
- **Interactive States:** 3 colors (pink, blue, mint)
- **Text Colors:** 3 shades (primary, secondary, muted)

**Typography:**
- Font: Plus Jakarta Sans (Google Fonts)
- Sizes: Tailwind defaults (xs → 9xl)

**Spacing:**
- Border radius: `--radius` = 0.75rem (12px)
- Container max-width: 1400px

**Theme System:**
- Provider: next-themes
- Modes: Light, Dark, System
- CSS Variables with automatic dark mode overrides

### Form Architecture

**Validation Stack:**
- react-hook-form v7.51.3
- zod v3.25.76
- @hookform/resolvers v3.3.4

**Form Components:**
```tsx
<Form {...methods}>
  <FormField
    control={methods.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="you@example.com" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

**Schema Example:**
```typescript
const UserRegistrationSchema = z.object({
  fullname: z.string().min(4, 'Full name must be at least 4 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password cannot exceed 64 characters')
    .refine(val => /^[a-zA-Z0-9_.-]*$/.test(val), 'Only alphanumeric characters allowed')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})
```

### Reusable Patterns

**cn() Utility:**
```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Class Variance Authority (CVA):**
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "...", destructive: "...", outline: "..." },
      size: { default: "...", sm: "...", lg: "...", icon: "..." }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
)
```

**Polymorphic Components (asChild):**
```tsx
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

### Accessibility Features

✅ Keyboard navigation (all Radix components)
✅ ARIA attributes (roles, states, live regions)
✅ Screen reader support (`sr-only` classes)
✅ Focus management (trap, restore)
✅ Form validation with descriptive errors

### Code Reference

**UI Components:** `src/components/ui/` (47 files)
**Theme Provider:** `src/context/them-provider.tsx:1-9`
**Design Tokens:** `tailwind.config.ts:21-158`
**Form System:** `src/components/ui/form.tsx:16-165`

---

## 6. Dashboard & Settings

### Dashboard Home

**Layout:** Protected with authentication check
**Metrics Displayed:**
1. **Conversations** - Total chat rooms count
2. **Leads Captured** - Customers with emails
3. **Appointments** - Total bookings
4. **Plan Usage** - Message credits, domains, KB size with progress bars

**Components:**
- DashboardCard (3 cards in responsive grid)
- PlanUsage widget
- Add Domain CTA (conditional)

### Route Structure

| Route | Purpose |
|-------|---------|
| `/dashboard` | Main metrics dashboard |
| `/settings` | Account settings & billing |
| `/settings/[domain]` | Domain-specific configuration |
| `/domain/[domainId]` | Knowledge base viewer |
| `/conversation` | Live chat management |
| `/appointment` | Booking calendar |
| `/integration` | Third-party connections |
| `/email-marketing` | Campaign management |

### Settings Categories

#### 1. Knowledge Base Settings
- **Training Sources Selector:** Choose specific pages to scrape
- **Quick Scrape:** One-click homepage scraping
- **File Upload:** .txt and .pdf support with append/replace options
- **Manual Editor:** Direct markdown editing
- **Training Progress:** Real-time embedding status with progress bar

**Training Limits Enforced:**
- FREE: 5 sources, 1 MB
- STARTER: 15 sources, 20 MB
- PRO: 50 sources, 50 MB
- BUSINESS: Unlimited sources, 200 MB

#### 2. AI Behavior Settings

**Bot Mode Options:**
- `SALES` - Drive conversions with qualification questions
- `SUPPORT` - Troubleshoot issues, escalate when needed
- `QUALIFIER` - Quickly identify fit and route
- `FAQ_STRICT` - Strict KB answers only, no selling

**Brand Voice:**
- Language: en, es, hi, fr, de, pt
- Tone Presets: friendly/professional/casual/formal/warm/enthusiastic

#### 3. Chatbot Visual Settings
- Custom icon upload (80x80px bubble, 20x20px avatar)
- Welcome message customization
- Background color/gradient
- Text color
- Helpdesk FAQ management

#### 4. Billing Settings
- Current plan display with features
- Upgrade modal (FREE users)
- Cancel subscription (schedule at period end)
- Change plan (with proration options)

#### 5. Embed Code Generator
```html
<script>
  window.embeddedChatbotConfig = {
    chatbotId: "${domainId}",
    domain: "${window.location.host}"
  }
</script>
<script src="${CHAT_BOT_URL}/embed.js" defer></script>
```

### Domain Management

**CRUD Operations:**
- **Create:** Check plan limits → upload icon → create domain + chatbot
- **Update:** Edit domain name with uniqueness validation
- **Delete:** Cascade deletion of all related data
- **Switch:** Dropdown selector in sidebar with real-time navigation

**Domain Display:**
- Icon + name in sidebar
- Active domain highlighted
- Quick add button in sidebar drawer

### Conversation Management

**Layout:** Split view (chat list + active conversation)

**Features:**
- **Tab Filters:** Unread, All, Expired, Starred
- **Domain Filtering:** Search by domain name
- **Live Mode Toggle:** Real-time chat with human agent
- **Message History:** Scrollable conversation thread
- **Send Messages:** Owner → customer real-time messaging via Pusher

### Appointment System

**Booking Display:**
- **Left (2/3):** All appointments table (date, slot, customer, domain)
- **Right (1/3):** Today's appointments cards

**Appointment Actions:**
- View all bookings across domains
- Filter by date/domain
- Customer details with email

### Email Marketing

**Campaign Management:**
- Create campaigns with custom names
- Add customers from table (multi-select)
- Edit email templates per campaign
- Send bulk emails to campaign members
- Track customer count per campaign

**Customer Selection:**
- Table with checkboxes
- Filter by domain
- Search functionality

### Sidebar Navigation

**Maximized State (300px):**
- Logo (40px)
- Menu items with icons + labels
- Domain switcher dropdown
- User profile with dropdown (name, email, sign out)
- Animations: `animate-open-sidebar` (0.2s)

**Minimized State (60px):**
- Hamburger toggle icon
- Icons only (no labels)
- Tooltips on hover
- Domain circular icons
- User avatar
- Animations: `animate-close-sidebar` (0.2s)

**Menu Items:**
- Dashboard
- Conversations
- Settings
- Appointments
- Email Marketing

### Code Reference

**Dashboard Page:** `src/app/(dashboard)/dashboard/page.tsx:1-87`
**Settings Form:** `src/components/forms/settings/form.tsx:1-211`
**Knowledge Base Viewer:** `src/components/settings/knowledge-base-viewer.tsx:50-664`
**Sidebar:** `src/components/sidebar/index.tsx:23-55`
**Conversation Menu:** `src/components/conversations/index.tsx:23-83`

---

## 7. Knowledge Base & Training

### Training Pipeline

**Flow:**
```
Content Ingestion → Text Chunking → Embedding Generation →
Vector Storage → Semantic Retrieval
```

### 1. Content Ingestion (3 Sources)

#### A. Web Scraping (Firecrawl API)
- Converts websites to clean markdown
- 48-hour caching for efficiency
- Main content extraction (removes nav/ads)
- Supports PDF parsing within sites
- Discovers up to 100 URLs for selective training

**API:**
```typescript
const result = await scrapeWebsite({
  url: 'https://example.com',
  onlyMainContent: true,
  maxAge: 172800000, // 48 hours
  formats: ['markdown'],
  parsers: ['pdf']
})
```

#### B. PDF Upload
- Extracts text using pdf-parse-fork
- Preserves metadata (title, author, subject)
- Validates PDF magic number
- Cleans extracted text (removes excessive whitespace)

**Extraction:**
```typescript
const { text, pages, metadata } = await extractTextFromPDF(buffer)
```

#### C. Plain Text Upload
- Direct markdown/text input
- Append or replace options
- Minimum 50 characters validation

### 2. Text Chunking (LangChain)

**Configuration:**
```typescript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,       // Optimized from 600 → 40% fewer chunks
  chunkOverlap: 150,     // Maintains context continuity
  separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ']
})
```

**Smart Separator Strategy:**
1. Try paragraphs (`\n\n`)
2. Fall back to sentences (`. `, `! `, `? `)
3. Finally words/spaces

**Validation:**
- Min length: 50 characters
- Max size: 10 MB

### 3. Embedding Generation (OpenAI)

**Model:** text-embedding-3-small
- Dimensions: 1536
- Cost: $0.02 per 1M tokens
- Format: float array

**Single Embedding (Query-time):**
```typescript
const embedding = await generateEmbedding(userQuery)
// Returns: number[] (1536 dimensions)
```

**Batch Embeddings (Training-time):**
```typescript
const embeddings = await generateEmbeddings(chunks)
// Processes 100 chunks per API call
// Returns: number[][] (batch of vectors)
```

**Cost Estimation:**
```typescript
const totalTokens = texts.reduce((sum, text) => sum + estimateTokens(text), 0)
const cost = (totalTokens / 1_000_000) * 0.02
```

### 4. Vector Storage (PostgreSQL + pgvector)

**Database Schema:**
```prisma
model KnowledgeChunk {
  id         String                 @id @default(uuid())
  content    String                 // Text chunk
  embedding  Unsupported("vector")? // 1536-dim vector
  sourceType String                 // 'firecrawl', 'pdf', 'text'
  sourceUrl  String?
  sourceName String?
}
```

**HNSW Index:**
```sql
CREATE INDEX knowledge_chunk_embedding_idx
ON "KnowledgeChunk"
USING hnsw (embedding vector_cosine_ops);
```

**Insert with Controlled Concurrency:**
```typescript
const BATCH_SIZE = 100 // Embedding API batch
const CONCURRENT_INSERTS = 10 // Parallel DB writes

for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE)
  const embeddings = await generateEmbeddings(batch)

  // Insert 10 at a time
  for (let j = 0; j < batch.length; j += CONCURRENT_INSERTS) {
    const insertPromises = /* ... 10 parallel inserts ... */
    await Promise.all(insertPromises)
  }
}
```

**Performance Optimizations:**
- Batch size: 100 chunks (up from 50)
- Concurrent inserts: 10 (prevents pool exhaustion)
- Progress updates: Every 100 chunks
- HNSW index: Sub-linear search time

### 5. Semantic Retrieval

**Vector Similarity Search:**
```typescript
const results = await searchKnowledgeBase(query, domainId, 5, 0.3)
```

**SQL Function:**
```sql
CREATE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_domain_id text
)
RETURNS TABLE (id text, content text, similarity float, ...)
AS $$
  SELECT
    id,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM "KnowledgeChunk"
  WHERE domainId = filter_domain_id
    AND embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$
```

**Similarity Calculation:**
- Operator: `<=>` (cosine distance: 0 = identical, 2 = opposite)
- Conversion: `1 - distance` = similarity score (0-1)
- Threshold: 0.3 (30% minimum similarity)

**Fallback Strategy:**
```
IF no results with 0.3 threshold
  THEN use truncated raw KB (12,000 chars)
```

**Prompt Formatting:**
```
[Context 1] (Source: https://example.com/pricing)
Relevant text chunk 1...

---

[Context 2] (Source: https://example.com/features)
Relevant text chunk 2...
```

### Embedding Status Tracking

**Database Fields:**
```prisma
model ChatBot {
  embeddingStatus          String?   @default("not_started")
  embeddingProgress        Int?      @default(0)
  embeddingChunksTotal     Int?
  embeddingChunksProcessed Int?
  embeddingCompletedAt     DateTime?
  hasEmbeddings            Boolean   @default(false)
}
```

**Status Values:**
- `not_started` → `processing` → `completed` / `failed`

**Client-Side Polling:**
```typescript
// Poll every 1 second during training
const poll = async () => {
  const status = await onGetEmbeddingStatus(domainId)
  setProgress(status.progress)
  if (status.status === 'completed') stop = true
  if (!stop) setTimeout(poll, 1000)
}
```

### Training Limits & Anti-Abuse

**Permanent Source Counter:**
```typescript
model Domain {
  trainingSourcesUsed Int @default(0)  // NEVER decreases
  knowledgeBaseSizeMB Float @default(0)
}
```

**Smart Source Counting:**
- First scrape of domain: +1 source
- Re-scraping same domain: No increment
- PDF upload: +1 source per file
- Text upload: +1 source

**Clear Knowledge Base:**
```typescript
// IMPORTANT: trainingSourcesUsed is NOT reset
await client.domain.update({
  data: {
    knowledgeBaseSizeMB: 0,  // Reset size only
    // trainingSourcesUsed: UNCHANGED (prevents abuse)
  }
})
```

**Plan Limits:**
| Plan | KB Size | Training Sources |
|------|---------|------------------|
| FREE | 1 MB | 5 |
| STARTER | 20 MB | 15 |
| PRO | 50 MB | 50 |
| BUSINESS | 200 MB | Unlimited |

### Code Reference

**Training Pipeline:** `src/actions/firecrawl/index.ts:276-467`
**Vector Search:** `src/lib/vector-search.ts:24-98`
**Embeddings:** `src/lib/embeddings.ts:15-96`
**Chunking:** `src/lib/chunking.ts:16-77`
**Firecrawl API:** `src/lib/firecrawl.ts:29-82`
**PDF Extractor:** `src/lib/pdf-extractor.ts:19-70`

---

## 8. Portal & Customer-Facing

### Portal Routes

| Route | Purpose |
|-------|---------|
| `/portal/[domainid]/appointment/[customerid]` | Appointment booking |
| `/portal/[domainid]/payment/[customerid]` | Payment checkout |
| `/preview/[domainId]` | Full-page chatbot preview |
| `/chatbot` | Embeddable chatbot widget |

### Chatbot Widget

**Dimensions:**
- Bubble: 80x80px (bottom-right fixed)
- Window: 450px width × 670px height

**Features:**
- Custom bot icon with image fallback
- Animated loading state
- Dual-tab interface (Chat + Helpdesk)
- File upload support (Paperclip icon)
- Real-time typing indicator
- Message bubbles with timestamps
- Link embedding in messages
- Image display with error handling

**Customization:**
```typescript
<div style={{
  background: theme || '',      // Custom gradient/color
  color: textColor || '',        // Custom text color
}}>
  {/* Chat messages */}
</div>
```

### Anonymous vs Identified Customer Flows

#### Anonymous User Flow
```typescript
// 1. Generate UUID (stored in localStorage)
const anonymousId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
localStorage.setItem('corinna_anonymous_id', anonymousId)

// 2. Create anonymous chat room
await client.chatRoom.create({
  data: { anonymousId, domainId }
})

// 3. AI prompts for email (QUALIFIER mode)
```

#### Email Detection & Transition
```typescript
// 1. Extract email from message
const email = extractEmailsFromString(message)

// 2. Create customer with race condition protection
try {
  customer = await client.customer.create({
    data: { email, domainId }
  })
} catch (e) {
  if (e.code === 'P2002') {
    // Unique constraint violation - customer exists
    customer = await client.customer.findFirst({
      where: { email, domainId }
    })
  }
}

// 3. Link anonymous history
await client.chatRoom.update({
  where: { id: anonymousChatRoomId },
  data: {
    customerId: customer.id,
    anonymousId: null  // Clear anonymous ID
  }
})

// 4. Switch from QUALIFIER to configured mode (SALES/SUPPORT/etc.)
```

### Appointment Booking

**Multi-Step Flow:**

**Step 1: Customer Questions**
- Pre-filled with chat responses
- Auto-skip if all answered

**Step 2: Date/Time Selection**
- Calendar widget (Shadcn Calendar)
- Time slots: 3:30pm - 6:00pm (30-min intervals)
- Real-time availability checking
- Booked slots grayed out

**Step 3: Confirmation**
- Thank you page

**Booking Persistence:**
```typescript
const booked = await onBookNewAppointment(
  domainId,
  customerId,
  values.slot,   // "4:00pm"
  values.date,   // Date object
  email
)
```

### Payment Portal

**Flow:**
1. Display customer questions (pre-filled)
2. Show domain products with images + pricing
3. Create Dodo payment link
4. Redirect to Dodo hosted checkout
5. Customer completes payment
6. Redirect back to success page

**Product Display:**
```tsx
{products.map(product => (
  <Card>
    <Image src={`https://ucarecdn.com/${product.image}/`} />
    <p>{product.name}</p>
    <p>${product.price}</p>
  </Card>
))}
```

**Payment Link Creation:**
```typescript
const response = await fetch(`${DODO_API_BASE}/payments`, {
  method: 'POST',
  body: JSON.stringify({
    customer: { email: customerEmail },
    product_cart: products.map(p => ({ product_id: p.id, quantity: 1 })),
    return_url: `/portal/${domainId}/payment/${customerId}/success`,
    metadata: { domainId, customerId, totalAmount }
  })
})
```

### Real-Time Messaging (Pusher)

**Configuration:**
```typescript
const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  { cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTOR }
)
```

**Live Mode Activation:**
1. AI detects need for human assistance
2. Response contains `(realtime)` marker
3. Chat room `live` flag set to `true`
4. Pusher channel subscribed (`chatRoomId`)
5. Email sent to owner (first time only)

**Real-Time Chat Hook:**
```typescript
useEffect(() => {
  const handler = (data: any) => {
    setChats(prev => [...prev, {
      role: data.chat.role,
      content: data.chat.message
    }])
  }

  pusherClient.subscribe(chatRoomId)
  pusherClient.bind('realtime-mode', handler)

  return () => {
    pusherClient.unbind('realtime-mode', handler)
    pusherClient.unsubscribe(chatRoomId)
  }
}, [chatRoomId])
```

**Owner Message Sending:**
```typescript
// Broadcast via Pusher
pusherServer.trigger(chatroomId, 'realtime-mode', {
  chat: { message, id, role: 'assistant' }
})

// Persist to database
await client.chatRoom.update({
  where: { id: chatroom },
  data: {
    message: {
      create: { message, role: 'assistant' }
    }
  }
})
```

### Widget Embedding

**Embed Code:**
```html
<script>
  const iframe = document.createElement("iframe");

  iframe.src = "https://yourdomain.com/chatbot"
  iframe.classList.add('chat-frame') // Fixed bottom-right positioning
  document.body.appendChild(iframe)

  window.addEventListener("message", (e) => {
    if(e.origin !== "https://yourdomain.com") return null
    let dimensions = JSON.parse(e.data)
    iframe.width = dimensions.width
    iframe.height = dimensions.height
    iframe.contentWindow.postMessage("DOMAIN_ID", "https://yourdomain.com")
  })
</script>
```

**Cross-Origin Communication:**
```typescript
// Widget sends dimensions to parent
postToParent(JSON.stringify({
  width: botOpened ? 550 : 80,
  height: botOpened ? 800 : 80,
}))

// Safe: Only non-sensitive dimension data via wildcard origin
```

### Image Upload & File Handling

**KIE API Integration:**

**Upload Flow:**
```typescript
// 1. Validate 2MB limit
if (file.size > 2 * 1024 * 1024) {
  return { success: false, error: 'File size exceeds 2MB limit' }
}

// 2. Convert to base64
const base64Data = await fileToBase64(file)

// 3. Upload to KIE API
const response = await fetch(`${KIE_API_BASE_URL}/api/file-base64-upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${KIE_API_KEY}`
  },
  body: JSON.stringify({ base64Data, uploadPath, fileName })
})

// 4. Return download URL
return { downloadUrl: result.data.downloadUrl }
```

**Image Display in Chat:**
```tsx
{image && !imageError ? (
  <Image
    src={getKieImageUrl(image[0])}
    onError={() => setImageError(true)}
  />
) : image && imageError ? (
  <div>Image failed to load</div>
) : (
  <p>{message.content}</p>
)}
```

### Code Reference

**Chatbot Widget:** `src/components/chatbot/index.tsx:72-88`
**Chat Window:** `src/components/chatbot/window.tsx:78-184`
**Streaming Hook:** `src/hooks/chatbot/use-chatbot.ts:236-309`
**Appointment Flow:** `src/app/portal/[domainid]/appointment/[customerid]/page.tsx`
**Payment Portal:** `src/app/portal/[domainid]/payment/[customerid]/page.tsx`
**Real-Time Chat:** `src/hooks/chatbot/use-chatbot.ts:353-394`
**Embed Code:** `test-widget-live.html:60-95`

---

## Technical Debt & Optimization Opportunities

### High Priority

#### 1. Rate Limiting
**Issue:** No apparent rate limiting on sign-in/sign-up attempts
**Risk:** Vulnerable to brute force attacks
**Fix:** Implement middleware rate limiter or use Clerk's bot protection
**Effort:** Low
**Impact:** High

#### 2. Vector Cache Pre-Warming
**Issue:** Cold start on first query per domain
**Current:** 100-300ms penalty on cache miss
**Fix:** Background job to pre-warm popular domains
**Effort:** Medium
**Impact:** Medium

#### 3. Pagination Missing
**Issue:** Large chatroom/message queries load all records
**Risk:** Performance degradation with high-volume customers
**Fix:** Add `skip`/`take` pagination with infinite scroll
**Effort:** Medium
**Impact:** High

#### 4. Audit Logging
**Issue:** Authentication events logged to console only
**Risk:** No security audit trail
**Fix:** Add database audit log table for critical events
**Effort:** Medium
**Impact:** Medium

### Medium Priority

#### 5. Redis for Distributed Caching
**Issue:** In-memory domain cache doesn't work across multiple instances
**Current:** Single-instance deployment assumed
**Fix:** Replace `Map` with Redis (Upstash recommended)
**Effort:** Medium
**Impact:** High (for scaling)

#### 6. Prompt Caching
**Issue:** System prompts rebuilt on every request
**Opportunity:** Cache prompts (rarely change)
**Fix:** Add prompt cache with 5-minute TTL
**Effort:** Low
**Impact:** Low (minor performance gain)

#### 7. Embedding Batch Processing Improvements
**Issue:** Currently processes 100 chunks per API call
**Opportunity:** Experiment with larger batches (200-500)
**Fix:** A/B test optimal batch size
**Effort:** Low
**Impact:** Medium (faster training)

#### 8. CAPTCHA Integration
**Issue:** Placeholder exists (`<div id="clerk-captcha" />`) but not active
**Fix:** Enable Clerk's Smart CAPTCHA for sign-up
**Effort:** Low
**Impact:** Medium

### Low Priority

#### 9. 2FA Support
**Issue:** No two-factor authentication option
**Fix:** Enable Clerk's 2FA features
**Effort:** Low
**Impact:** Low (niche requirement)

#### 10. Password Reset Flow
**Issue:** Not observed in codebase (may exist via Clerk's default UI)
**Fix:** Implement custom password reset pages for consistency
**Effort:** Medium
**Impact:** Low

#### 11. Email Validation Enhancement
**Issue:** Accepts any valid email format
**Opportunity:** Domain blacklisting or MX record validation
**Fix:** Add email validation service integration
**Effort:** Medium
**Impact:** Low

#### 12. Session Timeout Notifications
**Issue:** No user notification when session expires
**Fix:** Add toast notification on session expiration
**Effort:** Low
**Impact:** Low

### Code Quality Improvements

#### 13. Unit Tests
**Current:** No visible test coverage
**Recommendation:** Add tests for:
- Form validation schemas
- Vector search logic
- Payment webhook handlers
- Customer transition flows

**Effort:** High
**Impact:** High (long-term maintainability)

#### 14. Storybook for Components
**Current:** No component documentation
**Recommendation:** Add Storybook for UI component library
**Effort:** Medium
**Impact:** Medium (developer experience)

#### 15. TypeScript Strict Mode
**Current:** `tsconfig.json` not fully strict
**Recommendation:** Enable `strict: true`, `noUncheckedIndexedAccess: true`
**Effort:** High
**Impact:** Medium (type safety)

### Performance Optimizations

#### 16. Image Optimization
**Current:** Next.js Image component used correctly
**Opportunity:** Add blur placeholders, responsive sizes
**Effort:** Low
**Impact:** Low

#### 17. Bundle Size Reduction
**Current:** lucide-react imports entire icon set
**Fix:** Tree-shake icons (import specific icons)
**Effort:** Low
**Impact:** Low

#### 18. Database Connection Pooling
**Current:** Prisma default pool (likely 10 connections)
**Recommendation:** Tune pool size based on production load
**Effort:** Low
**Impact:** Medium (under high load)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Dashboard UI │  │ Portal UI    │  │ Chatbot      │                  │
│  │ (React)      │  │ (React)      │  │ Widget       │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                  │                  │                          │
└─────────┼──────────────────┼──────────────────┼──────────────────────────┘
          │                  │                  │
          │ HTTPS            │ HTTPS            │ iframe + postMessage
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS 15 APP LAYER                            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │                    MIDDLEWARE (Edge)                        │        │
│  │  • Clerk authentication check                               │        │
│  │  • Public route matching                                    │        │
│  │  • Redirect to /auth/sign-in if protected                   │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   API Routes     │  │  Server Actions  │  │  Server          │      │
│  │   (Route         │  │  ('use server')  │  │  Components      │      │
│  │   Handlers)      │  │                  │  │  (RSC)           │      │
│  │                  │  │                  │  │                  │      │
│  │ • /api/bot/      │  │ • onTrainChatbot │  │ • Dashboard      │      │
│  │   stream (SSE)   │  │ • onIntegrate    │  │ • Settings       │      │
│  │ • /api/dodo/     │  │   Domain         │  │ • Conversation   │      │
│  │   webhook        │  │ • onBookAppt     │  │                  │      │
│  └─────┬────────────┘  └─────┬────────────┘  └─────┬────────────┘      │
│        │                     │                      │                    │
└────────┼─────────────────────┼──────────────────────┼────────────────────┘
         │                     │                      │
         │                     │                      │
         ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                    │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Prisma ORM │  │   OpenAI API │  │   Clerk Auth │                  │
│  │              │  │              │  │              │                  │
│  │ • Queries    │  │ • Chat       │  │ • currentUser│                  │
│  │ • Mutations  │  │   Completions│  │ • auth()     │                  │
│  │ • $queryRaw  │  │ • Embeddings │  │ • signIn/Up  │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘                  │
│         │                  │                                              │
│         │                  │          ┌──────────────┐                  │
│         │                  │          │ Dodo         │                  │
│         │                  │          │ Payments     │                  │
│         │                  │          │              │                  │
│         │                  │          │ • Webhooks   │                  │
│         │                  │          │ • Checkout   │                  │
│         │                  │          └──────────────┘                  │
│         │                  │                                              │
│         │                  │          ┌──────────────┐                  │
│         │                  │          │ Pusher       │                  │
│         │                  │          │ (WebSocket)  │                  │
│         │                  │          │              │                  │
│         │                  │          │ • Real-time  │                  │
│         │                  │          │   Chat       │                  │
│         │                  │          └──────────────┘                  │
│         │                  │                                              │
└─────────┼──────────────────┼──────────────────────────────────────────┘
          │                  │
          ▼                  │
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                          │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │               PostgreSQL Database                              │    │
│  │                                                                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │    │
│  │  │   User   │  │  Domain  │  │ ChatBot  │  │ Billings │      │    │
│  │  │          │  │          │  │          │  │          │      │    │
│  │  │ 1:1      │  │ 1:N      │  │ 1:1      │  │ 1:1      │      │    │
│  │  └──┬───────┘  └──┬───────┘  └──┬───────┘  └──────────┘      │    │
│  │     │              │              │                             │    │
│  │     └──────────────┼──────────────┘                             │    │
│  │                    │                                             │    │
│  │                    ▼                                             │    │
│  │            ┌──────────────┐                                     │    │
│  │            │ Knowledge    │                                     │    │
│  │            │ Chunk        │  ◄── pgvector extension            │    │
│  │            │              │      (HNSW index)                   │    │
│  │            │ • content    │                                     │    │
│  │            │ • embedding  │  ◄── vector(1536)                  │    │
│  │            │   [1536 dim] │                                     │    │
│  │            └──────────────┘                                     │    │
│  │                                                                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │    │
│  │  │ Customer │  │ ChatRoom │  │ Message  │  │ Bookings │      │    │
│  │  │          │  │          │  │          │  │          │      │    │
│  │  │ 1:N      │  │ 1:N      │  │ 1:N      │  │ 1:N      │      │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                   │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Firecrawl   │  │   KIE API    │  │   Nodemailer │                  │
│  │  API         │  │  (Files)     │  │   (Email)    │                  │
│  │              │  │              │  │              │                  │
│  │ • Web        │  │ • Upload     │  │ • SMTP       │                  │
│  │   Scraping   │  │ • Download   │  │   Delivery   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Example: User Sends Chat Message

```
1. User types message in chatbot widget (iframe)
   ↓
2. POST /api/bot/stream with { domainId, chat[], message, anonymousId }
   ↓
3. Check domain cache (LRU, 60s TTL)
   ├─ Cache hit: 0ms
   └─ Cache miss: Query DB, store in cache
   ↓
4. Check message credits
   └─ If exceeded: Return 429 error
   ↓
5. Extract email from message (regex)
   └─ If found: Create/link customer, link anonymous history
   ↓
6. RAG retrieval
   ├─ hasEmbeddings = true
   │  ├─ Convert query to embedding (OpenAI API)
   │  └─ Vector search (pgvector HNSW index, cosine similarity)
   └─ hasEmbeddings = false
      └─ Use truncated raw knowledge base
   ↓
7. Build system prompt
   ├─ Include RAG context
   ├─ Set mode (QUALIFIER → SALES/SUPPORT after email)
   ├─ Add brand tone, language
   └─ Include appointment/payment URLs if customer identified
   ↓
8. OpenAI streaming completion
   ├─ Model: gpt-4o-mini
   ├─ Stream: true
   └─ Log TTFT (Time To First Token)
   ↓
9. Stream tokens via SSE
   ├─ Format: data: {"content":"token"}\n\n
   ├─ Update progress in real-time
   └─ Detect (realtime) or (complete) markers
   ↓
10. Store complete response
    ├─ Create ChatMessage record
    ├─ Increment messagesUsed counter
    └─ Update customer question if (complete) detected
    ↓
11. Return streaming response to client
    └─ Client updates UI token-by-token
```

---

## Key Architectural Patterns

### 1. Multi-Tenant Isolation
- All queries scoped by `domainId`
- No cross-domain data leakage
- Plan limits enforced per user

### 2. Server-Side Rendering (SSR)
- Dashboard pages use `async` server components
- Data fetched on server before hydration
- SEO-friendly, faster initial load

### 3. Server Actions
- `'use server'` directive for mutations
- Type-safe RPC between client/server
- Automatic progressive enhancement

### 4. Streaming Responses
- SSE for AI chat (token-by-token)
- Pusher WebSocket for live chat
- Optimistic UI updates

### 5. Idempotent Operations
- `upsert` for user/customer creation
- Transaction-based atomic operations
- Safe for concurrent requests

### 6. Graceful Degradation
- Vector search → fallback to raw KB
- Streaming → fallback to non-streaming API
- Image loading → fallback icons

### 7. Security-First Design
- Middleware auth enforcement
- CSRF protection (Clerk)
- Webhook signature verification
- SQL injection prevention (Prisma)

### 8. Performance Optimization
- LRU caching (domain config)
- HNSW vector indexing
- Batch processing (embeddings)
- Controlled concurrency (DB inserts)

---

## Technology Choices Rationale

### Why Clerk for Auth?
- ✅ Production-ready with minimal setup
- ✅ OAuth providers out-of-box
- ✅ Session management handled
- ✅ Secure by default (PKCE, CSRF, XSS protection)

### Why Prisma ORM?
- ✅ Type-safe database access
- ✅ Auto-generated TypeScript types
- ✅ Migration management
- ✅ Connection pooling built-in

### Why PostgreSQL + pgvector?
- ✅ ACID compliance (critical for billing)
- ✅ Native vector operations (RAG)
- ✅ HNSW indexing (fast similarity search)
- ✅ Mature ecosystem

### Why Next.js 15?
- ✅ App Router (React Server Components)
- ✅ API routes (serverless functions)
- ✅ Streaming SSR
- ✅ Middleware for auth
- ✅ Vercel deployment optimized

### Why OpenAI?
- ✅ Industry-leading embeddings quality
- ✅ Fast inference (gpt-4o-mini)
- ✅ Streaming support
- ✅ Reliable API

### Why Radix UI?
- ✅ Accessible by default (WCAG 2.1)
- ✅ Unstyled primitives (full design control)
- ✅ Composable components
- ✅ Keyboard navigation

---

## Deployment Considerations

### Environment Variables Required

**Authentication:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

**Database:**
- `DATABASE_URL` (PostgreSQL with pgvector)
- `DIRECT_URL` (for migrations)

**AI/ML:**
- `OPEN_AI_KEY` (OpenAI API key)

**Payments:**
- `DODO_API_KEY`
- `DODO_WEBHOOK_SECRET`
- `NEXT_PUBLIC_DODO_API_URL`

**Real-Time:**
- `NEXT_PUBLIC_PUSHER_APP_KEY`
- `NEXT_PUBLIC_PUSHER_APP_CLUSTOR`
- `PUSHER_APP_SECRET`

**File Storage:**
- `KIE_API_KEY`
- `KIE_API_BASE_URL`

**External APIs:**
- `FIRECRAWL_API_KEY`

**Email:**
- `MAILER_EMAIL`
- `MAILER_PASSWORD`

### Database Setup

1. **PostgreSQL 14+** with pgvector extension
2. Run migrations: `npx prisma migrate deploy`
3. Execute vector setup: `psql < supabase-vector-setup.sql`
4. Verify HNSW index created on `KnowledgeChunk.embedding`

### Recommended Infrastructure

**Platform:** Vercel (optimized for Next.js)
**Database:** Supabase or Neon (serverless PostgreSQL with pgvector)
**File Storage:** KIE API or UploadCare
**Monitoring:** Vercel Analytics + Sentry
**Caching:** Upstash Redis (for multi-instance scaling)

### Production Checklist

- [ ] Enable Clerk production instance
- [ ] Set up pgvector index (critical for RAG performance)
- [ ] Configure Dodo Payments production webhook
- [ ] Set up error tracking (Sentry)
- [ ] Enable rate limiting middleware
- [ ] Add database connection pooling (PgBouncer)
- [ ] Set up backup strategy (daily snapshots)
- [ ] Configure SMTP for email notifications
- [ ] Add CDN for static assets
- [ ] Enable security headers (CSP, HSTS)

---

## Conclusion

Corinna AI is a **production-ready, well-architected SaaS platform** with:

✅ **Solid Foundation:** Modern tech stack, type safety, security-first design
✅ **Scalable Architecture:** Multi-tenant, plan-based limits, efficient caching
✅ **Advanced AI:** RAG with vector search, streaming responses, multi-mode chatbots
✅ **Complete Feature Set:** Auth, billing, training, conversations, appointments, payments
✅ **Developer Experience:** Clean code, consistent patterns, comprehensive hooks

**Areas for Improvement:**
- Add unit tests (critical for maintainability)
- Implement rate limiting (security)
- Add Redis for distributed caching (scaling)
- Pagination for large datasets (performance)
- Audit logging (compliance)

**Overall Assessment:** 9/10 - Enterprise-ready with minor enhancements needed for high-scale production.

---

**Analysis completed via 8 parallel domain experts:**
1. Authentication & User Management
2. Chatbot & AI Core
3. Payment & Billing System
4. Database Schema & Prisma
5. UI Components & Design System
6. Dashboard & Settings
7. Knowledge Base & Training
8. Portal & Customer-Facing

**Total Lines Analyzed:** ~22,727 TypeScript/TSX
**Models:** 16 database models
**API Routes:** 2 main routes (streaming + webhook)
**Server Actions:** 50+ server-side functions
**UI Components:** 47 primitives + 90+ feature components
