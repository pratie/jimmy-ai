# Corinna AI - Comprehensive Codebase Documentation

> Last Updated: October 17, 2025
>
> Total Lines of Code: ~23,131 TypeScript/TSX lines

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [Directory Structure](#directory-structure)
6. [Key Features](#key-features)
7. [API Routes](#api-routes)
8. [Authentication & Authorization](#authentication--authorization)
9. [AI/LLM Integration](#aillm-integration)
10. [Real-time Features](#real-time-features)
11. [Payment Integration](#payment-integration)
12. [Development Setup](#development-setup)
13. [Environment Variables](#environment-variables)
14. [Key Files Reference](#key-files-reference)
15. [Code Patterns & Conventions](#code-patterns--conventions)

---

## Project Overview

**Corinna AI** (package name: `bookmylead`) is a full-stack SaaS platform for building and deploying AI-powered chatbots for websites. It enables businesses to create customized sales and support chatbots that can be embedded on their websites with comprehensive features including:

- **Multi-tenant architecture** - Each business gets their own domain with customizable chatbots
- **AI-powered conversations** - OpenAI GPT-4o-mini integration with RAG (Retrieval-Augmented Generation)
- **Knowledge base management** - Upload PDFs, scrape websites (Firecrawl), and train chatbot embeddings
- **Real-time chat** - Live handoff to human agents via Pusher
- **Lead qualification** - Capture emails, collect custom responses, book appointments
- **Email marketing** - Campaign management and customer targeting
- **Subscription billing** - Multi-tier plans (FREE, STARTER, PRO, BUSINESS) with Dodo Payments
- **Embeddable widget** - Easy iframe/script integration for any website

### Project Type
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel-ready

---

## Tech Stack

### Core Framework
- **Next.js 15.5.4** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5** - Type safety

### Backend & Database
- **Prisma 5.13.0** - ORM for PostgreSQL
- **PostgreSQL** - Primary database (via Supabase)
- **Supabase** - Database hosting + vector storage for embeddings

### Authentication & Authorization
- **Clerk 6.33.1** - User authentication and session management
- **Next.js Middleware** - Route protection (src/middleware.ts:1)

### AI & LLM
- **OpenAI GPT-4o-mini** - Primary LLM for chatbot conversations
- **@ai-sdk/openai 1.3.24** - OpenAI SDK integration
- **ai 4.3.19** - Vercel AI SDK for streaming responses
- **@langchain/textsplitters 0.1.0** - Document chunking for embeddings
- **pdf-parse-fork 1.2.0** - PDF text extraction

### Real-time Communication
- **Pusher 5.2.0** (server) - Real-time message broadcasting
- **pusher-js 8.4.0-rc2** (client) - Real-time subscriptions

### UI & Styling
- **TailwindCSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives (20+ components)
- **Shadcn/ui** - Pre-built component system
- **next-themes 0.3.0** - Dark mode support
- **lucide-react 0.378.0** - Icon library
- **Neobrutalism Design System** - Custom brand theme (tailwind.config.ts:1)

### Forms & Validation
- **react-hook-form 7.51.3** - Form state management
- **zod 3.25.76** - Schema validation
- **@hookform/resolvers 3.3.4** - Zod + React Hook Form integration

### Payment Processing
- **Dodo Payments** - Subscription billing provider
- **standardwebhooks 1.0.0** - Webhook verification

### Third-party Integrations
- **Firecrawl** - Website scraping for knowledge base
- **KIE API** - Image upload/storage service
- **NodeMailer** - Email notifications

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Bun** - Package manager (bun.lockb present)

---

## Architecture Overview

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  • Next.js App Router (RSC + Client Components)             │
│  • Embeddable Chatbot Widget (iframe/script)                │
│  • Real-time Pusher Client                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  • Clerk Authentication (src/middleware.ts:1)                │
│  • Route Protection (Dashboard vs Public)                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                 │
├─────────────────────────────────────────────────────────────┤
│  • /api/bot/stream - AI chatbot streaming                   │
│  • /api/upload - File upload proxy (KIE API)                │
│  • /api/dodo/webhook - Payment webhooks                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  • Server Actions (src/actions/**)                          │
│  • Custom Hooks (src/hooks/**)                              │
│  • Lib Functions (src/lib/**)                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  • Prisma ORM (src/lib/prisma.ts:1)                         │
│  • PostgreSQL (Supabase)                                    │
│  • Vector Store (Supabase pgvector)                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────┤
│  • OpenAI API (GPT-4o-mini)                                 │
│  • Pusher (Real-time)                                       │
│  • Dodo Payments (Billing)                                  │
│  • Firecrawl (Web scraping)                                 │
│  • KIE API (File storage)                                   │
│  • NodeMailer (Email)                                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: Chatbot Conversation

1. **User sends message** → Chatbot widget (client)
2. **POST /api/bot/stream** → Receives message + chat history
3. **Domain lookup** → Cached in-memory (60s TTL, 100 capacity LRU)
4. **Credits check** → Verify message limits for user's plan
5. **Email extraction** → Parse customer email if present
6. **Customer/ChatRoom management** → Create or link existing conversation
7. **RAG retrieval** →
   - If embeddings trained: Vector search (Supabase pgvector)
   - Else: Fallback to truncated knowledge base
8. **System prompt building** → Dynamic prompt with mode (SALES/SUPPORT/QUALIFIER/FAQ_STRICT)
9. **OpenAI streaming** → GPT-4o-mini with 800 token limit
10. **Response streaming** → Server-Sent Events (SSE) to client
11. **Store messages** → Persist in ChatMessage table
12. **Increment credits** → Update messagesUsed counter

---

## Database Schema

### Core Models (Prisma Schema: prisma/schema.prisma:1)

#### User (Line 11-25)
```prisma
model User {
  id             String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  fullname       String
  clerkId        String     @unique
  type           String
  email          String?
  dodoMerchantId String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  // Relations
  Account        Account[]
  subscription   Billings?
  campaign       Campaign[]
  domains        Domain[]
  Session        Session[]
}
```

#### Domain (Line 27-49)
Multi-tenant container for each business/website.

```prisma
model Domain {
  id                  String            @id @db.Uuid
  name                String            // Business name
  icon                String
  userId              String?           @db.Uuid
  campaignId          String?           @db.Uuid
  knowledgeBaseSizeMB Float             @default(0)
  trainingSourcesUsed Int               @default(0)

  // Relations
  chatBot             ChatBot?
  chatRooms           ChatRoom[]
  customer            Customer[]
  filterQuestions     FilterQuestions[]
  helpdesk            HelpDesk[]
  knowledgeChunks     KnowledgeChunk[]
  products            Product[]
}
```

#### ChatBot (Line 51-73)
Configuration for the AI chatbot.

```prisma
model ChatBot {
  id                       String           @id @db.Uuid
  welcomeMessage           String?
  icon                     String?
  background               String?
  textColor                String?
  helpdesk                 Boolean          @default(false)
  domainId                 String?          @unique @db.Uuid
  knowledgeBase            String?          // Markdown/text content
  knowledgeBaseUpdatedAt   DateTime?
  knowledgeBaseStatus      String?          @default("pending")
  mode                     String?          @default("SALES")
  brandTone                String?          @default("friendly, concise")
  language                 String?          @default("en")

  // Embedding/RAG status
  embeddingStatus          String?          @default("not_started")
  embeddingProgress        Int?             @default(0)
  embeddingChunksTotal     Int?
  embeddingChunksProcessed Int?
  embeddingCompletedAt     DateTime?
  hasEmbeddings            Boolean          @default(false)

  knowledgeChunks          KnowledgeChunk[]
}
```

#### Billings (Line 75-91)
Subscription and usage tracking.

```prisma
model Billings {
  id                     String          @id @db.Uuid
  plan                   Plans           @default(FREE)
  messageCredits         Int             @default(100)
  messagesUsed           Int             @default(0)
  messagesResetAt        DateTime        @default(now())
  billingInterval        BillingInterval @default(MONTHLY)
  provider               String?         // "dodo"
  providerSubscriptionId String?         @unique
  status                 String?
  cancelAtPeriodEnd      Boolean?        @default(false)
  endsAt                 DateTime?
}

enum Plans {
  FREE      // 100 messages/month
  STARTER   // More credits
  PRO       // More credits
  BUSINESS  // More credits
}
```

#### ChatRoom (Line 134-149)
Conversation container for customer interactions.

```prisma
model ChatRoom {
  id          String        @id @db.Uuid
  live        Boolean       @default(false)  // Human takeover mode
  mailed      Boolean       @default(false)  // Email notification sent
  customerId  String?       @db.Uuid         // Linked customer
  anonymousId String?                        // Anonymous user tracking
  domainId    String?       @db.Uuid
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  message     ChatMessage[]
}
```

#### ChatMessage (Line 151-162)
Individual messages in conversations.

```prisma
model ChatMessage {
  id         String    @id @db.Uuid
  message    String
  role       Role?     // 'user' or 'assistant'
  chatRoomId String?   @db.Uuid
  seen       Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

enum Role {
  user
  assistant
}
```

#### KnowledgeChunk (Line 198-215)
RAG vector embeddings for semantic search.

```prisma
model KnowledgeChunk {
  id         String                 @id @db.Uuid
  domainId   String                 @db.Uuid
  chatBotId  String                 @db.Uuid
  content    String                 // Text chunk
  embedding  Unsupported("vector")? // pgvector embedding
  sourceType String                 // "pdf", "url", "text"
  sourceUrl  String?
  sourceName String?
  createdAt  DateTime               @default(now())

  @@index([domainId])
  @@index([chatBotId])
  @@index([sourceType])
}
```

#### Customer (Line 121-132)
Tracked website visitors/leads.

```prisma
model Customer {
  id        String              @id @db.Uuid
  email     String?
  domainId  String?             @db.Uuid

  booking   Bookings[]
  chatRoom  ChatRoom[]
  questions CustomerResponses[] // Custom qualification responses

  @@unique([email, domainId])
}
```

### Database Setup Files
- `setup-dev-db.sql` - Development database initialization
- `supabase-vector-setup.sql` - pgvector extension setup for embeddings
- `add-chatbot-embedding-fields.sql` - Migration for embedding status fields

---

## Directory Structure

```
corinna-ai-main/
├── prisma/
│   └── schema.prisma              # Database schema
├── public/
│   ├── images/                    # App UI images
│   └── blogimages/                # Blog assets
├── src/
│   ├── actions/                   # Server Actions (Next.js)
│   │   ├── appointment/           # Booking management
│   │   ├── auth/                  # Authentication actions
│   │   ├── bot/                   # Chatbot configuration
│   │   ├── conversation/          # Chat management
│   │   ├── dashboard/             # Analytics/stats
│   │   ├── dodo/                  # Payment operations
│   │   ├── firecrawl/             # Website scraping
│   │   ├── landing/               # Public pages
│   │   ├── mail/                  # Email sending
│   │   ├── mailer/                # Email templates
│   │   ├── onboarding/            # User onboarding flow
│   │   ├── payments/              # Subscription management
│   │   └── settings/              # Domain/chatbot settings
│   │
│   ├── app/                       # Next.js App Router
│   │   ├── (dashboard)/           # Protected dashboard routes
│   │   │   ├── dashboard/         # Analytics page
│   │   │   ├── conversation/      # Chat inbox
│   │   │   ├── settings/          # Domain settings
│   │   │   ├── appointment/       # Bookings page
│   │   │   ├── email-marketing/   # Campaign manager
│   │   │   ├── integration/       # Third-party integrations
│   │   │   └── domain/[domainId]/ # Domain-specific views
│   │   │
│   │   ├── api/                   # API Routes
│   │   │   ├── bot/stream/        # Chatbot streaming endpoint
│   │   │   ├── upload/            # File upload proxy
│   │   │   └── dodo/webhook/      # Payment webhooks
│   │   │
│   │   ├── auth/                  # Clerk auth pages
│   │   ├── chatbot/               # Public chatbot page
│   │   ├── chatbot-iframe/        # Embeddable chatbot
│   │   ├── portal/                # Customer-facing portal
│   │   ├── onboarding/            # New user setup
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles
│   │
│   ├── components/                # React Components
│   │   ├── ui/                    # Shadcn/ui primitives
│   │   ├── chatbot/               # Chatbot widget components
│   │   ├── conversations/         # Chat inbox UI
│   │   ├── dashboard/             # Dashboard widgets
│   │   ├── settings/              # Settings forms
│   │   ├── forms/                 # Reusable form components
│   │   ├── auth/                  # Sign in/up forms
│   │   ├── landing/               # Landing page sections
│   │   ├── sidebar/               # Navigation sidebar
│   │   ├── navbar/                # Top navigation
│   │   ├── email-marketing/       # Campaign UI
│   │   ├── appointment/           # Booking components
│   │   ├── products/              # Product display
│   │   ├── integrations/          # Integration cards
│   │   └── portal/                # Customer portal components
│   │
│   ├── constants/                 # Configuration & Constants
│   │   ├── menu.tsx               # Sidebar navigation config
│   │   ├── forms.ts               # Form field definitions
│   │   ├── integrations.ts        # Integration metadata
│   │   ├── landing-page.ts        # Landing page content
│   │   └── timeslots.ts           # Appointment time slots
│   │
│   ├── context/                   # React Context Providers
│   │   ├── use-chatbot/           # Chatbot state management
│   │   ├── use-sidebar/           # Sidebar state
│   │   └── use-theme/             # Theme toggle
│   │
│   ├── hooks/                     # Custom React Hooks
│   │   ├── billing/               # Subscription hooks
│   │   ├── chatbot/               # Chatbot logic hooks
│   │   ├── conversation/          # Chat hooks
│   │   ├── email-marketing/       # Campaign hooks
│   │   ├── firecrawl/             # Web scraping hooks
│   │   ├── portal/                # Customer portal hooks
│   │   ├── settings/              # Settings hooks
│   │   ├── sidebar/               # Sidebar hooks
│   │   ├── sign-in/               # Sign in hooks
│   │   └── sign-up/               # Sign up hooks
│   │
│   ├── lib/                       # Utility Libraries
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── utils.ts               # General utilities
│   │   ├── promptBuilder.ts       # AI system prompt builder
│   │   ├── vector-search.ts       # RAG semantic search
│   │   ├── embeddings.ts          # OpenAI embeddings
│   │   ├── chunking.ts            # Text chunking for RAG
│   │   ├── pdf-extractor.ts       # PDF text extraction
│   │   ├── firecrawl.ts           # Website scraping
│   │   ├── kie-api.ts             # Image upload API
│   │   ├── pusher-server.ts       # Pusher server config
│   │   ├── pusher-client.ts       # Pusher client config
│   │   ├── plans.ts               # Subscription plan logic
│   │   └── onboarding/            # Onboarding utilities
│   │
│   ├── schemas/                   # Zod Validation Schemas
│   │   ├── auth.schema.ts         # Auth form validation
│   │   ├── settings.schema.ts     # Settings validation
│   │   ├── conversation.schema.ts # Chat validation
│   │   └── marketing.schema.ts    # Campaign validation
│   │
│   ├── types/                     # TypeScript Type Definitions
│   │   └── index.d.ts             # Shared types
│   │
│   ├── icons/                     # Custom SVG Icons
│   │   ├── chat-icon.tsx
│   │   ├── dashboard-icon.tsx
│   │   ├── settings-icon.tsx
│   │   └── ...
│   │
│   └── middleware.ts              # Clerk auth middleware
│
├── .env.local                     # Environment variables (gitignored)
├── .env.example                   # Environment template
├── next.config.mjs                # Next.js configuration
├── tailwind.config.ts             # TailwindCSS config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
├── llm_modes.md                   # AI prompt documentation
└── SECURITY_FIXES_APPLIED.md      # Security changelog
```

---

## Key Features

### 1. Multi-Tenant Domain Management
- Each user can create multiple domains (businesses/websites)
- Per-domain chatbot customization:
  - Welcome message
  - Brand colors (background, text)
  - Custom icon
  - Chatbot mode (SALES/SUPPORT/QUALIFIER/FAQ_STRICT)
  - Brand tone and language
- Knowledge base management per domain

### 2. AI Chatbot with RAG
**Technology**: OpenAI GPT-4o-mini + Supabase pgvector

**Flow** (src/app/api/bot/stream/route.ts:1):
1. **Domain caching** - 60-second in-memory LRU cache (100 capacity)
2. **Credit checking** - Verify message limits before responding
3. **Customer identification** - Email extraction and linking
4. **Knowledge retrieval**:
   - **With embeddings**: Vector similarity search (Supabase pgvector)
   - **Without embeddings**: Truncated markdown fallback
5. **Dynamic prompt building** (src/lib/promptBuilder.ts:1):
   - Business context (name, domain, knowledge base)
   - Mode-specific instructions (SALES/SUPPORT/QUALIFIER/FAQ_STRICT)
   - Brand tone and language
   - Qualification questions
   - Portal/appointment/payment URLs
6. **Streaming response** - Server-Sent Events (SSE) with 800 token limit
7. **Live mode detection** - Hand off to human agent if `live: true`

**Chatbot Modes** (llm_modes.md:1):
- **SALES**: Lead qualification, funnel advancement, booking/payment CTAs
- **SUPPORT**: Issue resolution, KB-grounded troubleshooting
- **QUALIFIER**: Fast lead qualification, email collection
- **FAQ_STRICT**: FAQ-only mode, escalates if not in KB

### 3. Knowledge Base Training
**Sources**:
- **PDF Upload** - Extract text via pdf-parse-fork
- **Website Scraping** - Firecrawl API integration
- **Manual Text** - Direct markdown input

**Processing Pipeline**:
1. **Text Extraction** - Parse PDFs or scrape URLs
2. **Chunking** (src/lib/chunking.ts:1) - Split into semantic chunks (LangChain)
3. **Embedding Generation** (src/lib/embeddings.ts:1) - OpenAI text-embedding-ada-002
4. **Vector Storage** (src/lib/vector-search.ts:1) - Store in KnowledgeChunk with pgvector
5. **Status Tracking**:
   - `embeddingStatus`: "not_started" | "processing" | "completed" | "failed"
   - `embeddingProgress`: % completion
   - `hasEmbeddings`: Boolean flag for quick checks

**RAG Search** (src/lib/vector-search.ts:1):
```typescript
searchKnowledgeBaseWithFallback(query, domainId, limit)
  → Semantic vector search via Supabase
  → Returns top K relevant chunks
  → Fallback to truncated KB if no embeddings
```

### 4. Real-time Chat with Live Handoff
**Technology**: Pusher (server + client)

**Features**:
- **Live mode toggle** - ChatRoom.live flag
- **Human takeover** - Stop AI responses when live mode activated
- **Real-time notifications** - Pusher broadcasts new messages
- **Seen status** - ChatMessage.seen tracking
- **Email alerts** - ChatRoom.mailed flag for notifications

**Configuration**:
- Server: `src/lib/pusher-server.ts:1`
- Client: `src/lib/pusher-client.ts:1`
- Channels: Domain-specific (e.g., `presence-domain-{domainId}`)

### 5. Lead Qualification & Customer Management
**Customer Lifecycle**:
1. **Anonymous visitor** - ChatRoom with `anonymousId`
2. **Email capture** - Extract email from message
3. **Customer creation** - Create Customer record
4. **Link chat history** - Update ChatRoom.customerId
5. **Qualification questions** - FilterQuestions per domain
6. **Custom responses** - CustomerResponses storage
7. **Appointment booking** - Bookings table

**Email Detection** (src/lib/utils.ts:1):
```typescript
extractEmailsFromString(message: string) → string[]
```

**Race Condition Handling** (src/app/api/bot/stream/route.ts:254):
- Handles concurrent customer creation with P2002 error retry

### 6. Subscription Billing
**Provider**: Dodo Payments

**Plans** (src/lib/plans.ts:1):
```typescript
FREE: {
  messageCredits: 100,
  domains: 1,
  contacts: 100,
}
STARTER: {
  messageCredits: 500,
  domains: 2,
  contacts: 500,
}
PRO: {
  messageCredits: 2000,
  domains: 5,
  contacts: 2000,
}
BUSINESS: {
  messageCredits: 5000,
  domains: 10,
  contacts: 5000,
}
```

**Billing Features**:
- Monthly/Yearly intervals
- Message credit tracking (Billings.messagesUsed)
- Auto-reset on billing period (Billings.messagesResetAt)
- Webhook integration (src/app/api/dodo/webhook/route.ts:1)
- Subscription status tracking (active, canceled, etc.)

### 7. Email Marketing
**Features**:
- Campaign creation (Campaign model)
- Customer segmentation
- Email template builder
- Bulk email sending via NodeMailer

**Configuration**:
- SMTP: NodeMailer with Gmail app passwords
- Templates: `src/actions/mailer/`

### 8. Appointment Booking
**Features**:
- Time slot selection (src/constants/timeslots.ts:1)
- Customer booking tracking (Bookings model)
- Email confirmations
- Calendar integration ready

### 9. Embeddable Widget
**Integration Methods**:
1. **Iframe**:
   ```html
   <iframe src="{APP_URL}/chatbot-iframe?domain={domainId}" />
   ```
2. **Script injection**:
   ```html
   <script src="{APP_URL}/chatbot.js?domain={domainId}"></script>
   ```

**Widget Components** (src/components/chatbot/):
- `bubble.tsx` - Floating chat button
- `window.tsx` - Chat window UI
- `responding.tsx` - AI typing indicator
- `real-time.tsx` - Live mode indicator

**Widget Routes**:
- `/chatbot` - Standalone chatbot page
- `/chatbot-iframe` - Embeddable iframe version

### 10. Customer Portal
**Route**: `/portal/[domainId]`

**Features**:
- Public-facing chat interface
- Product browsing
- Appointment booking
- Payment checkout
- No authentication required (public routes in middleware)

---

## API Routes

### Core API Endpoints

#### POST /api/bot/stream
**Purpose**: Main chatbot conversation endpoint with streaming responses

**Location**: `src/app/api/bot/stream/route.ts:87`

**Request Body**:
```typescript
{
  domainId: string,
  chat: Array<{role: 'user' | 'assistant', content: string}>,
  message: string,
  anonymousId?: string
}
```

**Response**: Server-Sent Events (SSE) stream
```
data: {"content": "Hello"}\n\n
data: {"content": " how"}\n\n
data: {"content": " can"}\n\n
...
data: [DONE]\n\n
```

**Error Responses**:
- 400: Invalid request format
- 404: Chatbot not found
- 429: Message limit reached (with plan info)
- 200 (live mode): `{error: "Live mode active", live: true, chatRoom: id}`

**Performance Optimizations**:
- Domain config caching (60s TTL, LRU)
- Parallel database queries
- Streaming responses (low TTFT)
- Max response: 800 tokens

**Metrics Logged** (Line 512):
```
cache=hit/miss
ttftMs=123
streamMs=456
totalMs=789
domainHitRatio=0.85
```

#### POST /api/upload
**Purpose**: Proxy for file uploads to KIE API (hides server API key)

**Location**: `src/app/api/upload/route.ts:1`

**Usage**: Image uploads in chat, knowledge base PDFs

**Security**: Server-side API key injection

#### POST /api/dodo/webhook
**Purpose**: Handle Dodo Payments webhooks for subscription events

**Location**: `src/app/api/dodo/webhook/route.ts:1`

**Events Handled**:
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`
- `payment.succeeded`
- `payment.failed`

**Security**: Webhook signature verification with `standardwebhooks`

---

## Authentication & Authorization

### Provider: Clerk v6

**Configuration** (src/middleware.ts:1):
```typescript
// Public routes (no auth required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/portal(.*)',
  '/chatbot',
  '/api/bot(.*)',
  '/api/upload',
  '/api/dodo(.*)',
])

// Protected routes (auth required)
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()  // Redirect to sign-in if not authenticated
  }
})
```

### User Model Integration
- Clerk manages authentication
- User table (Prisma) stores app-specific data:
  - `clerkId` - Link to Clerk user
  - `fullname`, `email`, `type`
  - `dodoMerchantId` - Payment provider ID

### Session Management
- Clerk session cookies
- Session table for NextAuth compatibility (future-proofing)

### Route Protection Patterns
1. **Dashboard routes**: `(dashboard)` route group → Always protected
2. **API routes**: Explicitly check auth in handlers
3. **Portal routes**: Public (no auth)
4. **Chatbot routes**: Public (no auth)

---

## AI/LLM Integration

### OpenAI Configuration

**Model**: GPT-4o-mini (cost-effective, fast)

**Client Setup** (src/app/api/bot/stream/route.ts:67):
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 2,
})
```

**Max Duration**: 30 seconds (Vercel limit)

### System Prompt Architecture

**Builder Function** (src/lib/promptBuilder.ts:1):
```typescript
buildSystemPrompt({
  businessName: string,
  domain: string,
  knowledgeBase: string,
  mode: 'SALES' | 'SUPPORT' | 'QUALIFIER' | 'FAQ_STRICT',
  brandTone?: string,
  language?: string,
  qualificationQuestions: string[],
  appointmentUrl?: string,
  paymentUrl?: string,
  portalBaseUrl?: string,
  customerId?: string,
})
```

**Prompt Structure** (llm_modes.md:9):
```
[SYSTEM BASE v1]
- Identity: "Icon AI for {businessName}"
- Knowledge Base: Truncated/RAG-retrieved content
- Brand Voice: {brandTone} in {language}
- Qualification Questions: Enumerated list
- Tools/Links: Appointment/Payment URLs
- Rules: On-topic only, cite KB, respect mode
- Output Structure: action + tags [(complete)|(realtime)]

[MODE: {SALES|SUPPORT|QUALIFIER|FAQ_STRICT}]
- Mode-specific behaviors and goals
```

**Special Tags**:
- `(complete)` - Append when asking qualification questions
- `(realtime)` - Trigger human handoff for out-of-scope queries

### RAG Implementation

**Vector Search** (src/lib/vector-search.ts:1):
```typescript
async function searchKnowledgeBaseWithFallback(
  query: string,
  domainId: string,
  limit: number = 5
): Promise<Array<{content: string, similarity: number}>>
```

**Supabase RPC Call**:
```sql
SELECT content, 1 - (embedding <=> query_embedding) as similarity
FROM "KnowledgeChunk"
WHERE "domainId" = $1
ORDER BY embedding <=> query_embedding
LIMIT $2
```

**Fallback Strategy** (Line 204):
- If `hasEmbeddings = false`: Use truncated `knowledgeBase` field
- Truncation: 12,000 characters (src/lib/firecrawl.ts:1)

### Streaming Implementation

**SSE Format** (src/app/api/bot/stream/route.ts:498):
```typescript
controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
```

**Client Consumption**:
```typescript
const response = await fetch('/api/bot/stream', {
  method: 'POST',
  body: JSON.stringify({ domainId, chat, message, anonymousId }),
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  const lines = chunk.split('\n\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6))
      if (data.content) {
        // Append to UI
      }
    }
  }
}
```

---

## Real-time Features

### Pusher Configuration

**Server** (src/lib/pusher-server.ts:1):
```typescript
import Pusher from 'pusher'

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})
```

**Client** (src/lib/pusher-client.ts:1):
```typescript
import PusherClient from 'pusher-js'

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  }
)
```

### Real-time Events

**Channel Naming**: `presence-domain-{domainId}`

**Events**:
1. `new-message` - New chat message received
2. `live-mode-toggle` - Human agent joined/left
3. `typing-indicator` - Agent is typing

**Live Mode Flow**:
1. User switches `ChatRoom.live` to `true`
2. Pusher broadcasts `live-mode-toggle` event
3. Chatbot widget shows "Live Agent" indicator
4. AI responses stop (`/api/bot/stream` returns `{live: true}`)
5. Human agent responds via dashboard
6. Messages synced via Pusher

---

## Payment Integration

### Provider: Dodo Payments

**Product IDs** (.env.example:36):
```
# Monthly Plans
DODO_PRODUCT_ID_STARTER=pdt_xxx
DODO_PRODUCT_ID_PRO=pdt_xxx
DODO_PRODUCT_ID_BUSINESS=pdt_xxx

# Yearly Plans
DODO_PRODUCT_ID_STARTER_YEARLY=pdt_xxx
DODO_PRODUCT_ID_PRO_YEARLY=pdt_xxx
DODO_PRODUCT_ID_BUSINESS_YEARLY=pdt_xxx
```

### Subscription Flow

1. **User selects plan** → Settings page
2. **Create checkout** → `src/actions/payments/`
3. **Redirect to Dodo** → Hosted checkout page
4. **Payment success** → Webhook to `/api/dodo/webhook`
5. **Update Billings** → Set plan, credits, subscriptionId
6. **Redirect to dashboard** → `NEXT_PUBLIC_RETURN_URL`

### Webhook Handling (src/app/api/dodo/webhook/route.ts:1)

**Signature Verification**:
```typescript
import { Webhook } from 'standardwebhooks'

const wh = new Webhook(process.env.DODO_WEBHOOK_SECRET!)
const payload = wh.verify(body, headers)
```

**Event Processing**:
- `subscription.created` → Create Billings record
- `subscription.updated` → Update plan/credits
- `subscription.canceled` → Set `cancelAtPeriodEnd = true`
- `payment.failed` → Email notification

### Credit Management (src/lib/plans.ts:1)

**Auto-reset Logic** (src/app/api/bot/stream/route.ts:157):
```typescript
if (shouldResetCredits(billing.messagesResetAt)) {
  const limits = getPlanLimits(billing.plan)
  await client.billings.update({
    where: { userId },
    data: {
      messagesUsed: 0,
      messageCredits: limits.messageCredits,
      messagesResetAt: getNextResetDate()  // +30 days
    }
  })
}
```

**Credit Enforcement**:
```typescript
if (billing.messagesUsed >= billing.messageCredits) {
  return new Response(JSON.stringify({
    error: 'Message limit reached',
    limitReached: true,
    plan: billing.plan
  }), { status: 429 })
}
```

---

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL (or Supabase account)
- Bun (optional, npm/yarn also work)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd corinna-ai-main

# Install dependencies
npm install
# OR
bun install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Setup pgvector for embeddings
psql $DATABASE_URL < supabase-vector-setup.sql

# Start development server
npm run dev
# OR
bun dev
```

### Development Server
- URL: http://localhost:3000
- Hot reload enabled
- Strict mode disabled (next.config.mjs:3)

### Database Management

```bash
# Create migration
npx prisma migrate dev --name <migration_name>

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio
```

### Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start

# Vercel deployment
vercel deploy
```

---

## Environment Variables

### Required Variables (.env.example:1)

#### OpenAI
```bash
OPENAI_API_KEY=sk-proj-xxx
```

#### KIE API (File Storage)
```bash
KIE_API_KEY=xxx
```

#### NodeMailer
```bash
NODE_MAILER_EMAIL=your-email@gmail.com
NODE_MAILER_GMAIL_APP_PASSWORD=xxx
```

#### Pusher
```bash
# Server-side (secret)
PUSHER_APP_ID=xxx
PUSHER_KEY=xxx
PUSHER_SECRET=xxx
PUSHER_CLUSTER=ap2

# Client-side (public)
NEXT_PUBLIC_PUSHER_APP_KEY=xxx
NEXT_PUBLIC_PUSHER_APP_CLUSTER=ap2
```

#### Clerk
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

#### Dodo Payments
```bash
DODO_API_KEY=xxx
DODO_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_DODO_API_URL=https://api.dodopayments.com

# Product IDs (monthly)
DODO_PRODUCT_ID_STARTER=pdt_xxx
DODO_PRODUCT_ID_PRO=pdt_xxx
DODO_PRODUCT_ID_BUSINESS=pdt_xxx

# Product IDs (yearly)
DODO_PRODUCT_ID_STARTER_YEARLY=pdt_xxx
DODO_PRODUCT_ID_PRO_YEARLY=pdt_xxx
DODO_PRODUCT_ID_BUSINESS_YEARLY=pdt_xxx
```

#### Firecrawl
```bash
FIRECRAWL_API_KEY=fc-xxx
FIRECRAWL_API_URL=https://api.firecrawl.dev/v2
```

#### App Configuration
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RETURN_URL=http://localhost:3000/settings
```

#### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

#### Prisma/PostgreSQL
```bash
# Connection pooling (via PgBouncer)
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"

# Direct connection (for migrations)
DIRECT_URL="postgresql://user:pass@host:5432/postgres"
```

#### Optional
```bash
ANTHROPIC_API_KEY=sk-ant-xxx  # Future Claude integration
```

---

## Key Files Reference

### Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| `next.config.mjs:1` | Next.js config | Image domains, webpack canvas alias |
| `tailwind.config.ts:1` | TailwindCSS theming | Neobrutalism design system, animations |
| `tsconfig.json:1` | TypeScript config | Strict mode, path aliases |
| `prisma/schema.prisma:1` | Database schema | All models and relations |
| `components.json:1` | Shadcn/ui config | Component path aliases |
| `middleware.ts:1` | Route protection | Public vs protected routes |

### Core Library Files

| File | Purpose | Key Functions |
|------|---------|---------------|
| `lib/prisma.ts:1` | Prisma client | Singleton pattern |
| `lib/utils.ts:1` | General utilities | `cn()`, `extractEmailsFromString()` |
| `lib/promptBuilder.ts:1` | AI prompt generation | `buildSystemPrompt()` |
| `lib/vector-search.ts:1` | RAG search | `searchKnowledgeBaseWithFallback()` |
| `lib/embeddings.ts:1` | OpenAI embeddings | `generateEmbedding()` |
| `lib/chunking.ts:1` | Text splitting | `chunkText()` |
| `lib/plans.ts:1` | Billing logic | `getPlanLimits()`, `shouldResetCredits()` |
| `lib/firecrawl.ts:1` | Web scraping | `scrapeUrl()`, `truncateMarkdown()` |
| `lib/pdf-extractor.ts:1` | PDF parsing | `extractTextFromPDF()` |
| `lib/kie-api.ts:1` | File upload | `uploadToKIE()` |

### Main API Routes

| Route | File | Purpose |
|-------|------|---------|
| `/api/bot/stream` | `src/app/api/bot/stream/route.ts:87` | AI chatbot conversations |
| `/api/upload` | `src/app/api/upload/route.ts:1` | File upload proxy |
| `/api/dodo/webhook` | `src/app/api/dodo/webhook/route.ts:1` | Payment webhooks |

### Important Components

| Component | File | Purpose |
|-----------|------|---------|
| Chatbot Widget | `components/chatbot/index.tsx:1` | Main chatbot UI |
| Chat Window | `components/chatbot/window.tsx:1` | Chat interface |
| Chat Bubble | `components/chatbot/bubble.tsx:1` | Floating button |
| Real-time Indicator | `components/chatbot/real-time.tsx:1` | Live mode UI |
| Sidebar Navigation | `components/sidebar/index.tsx:1` | Dashboard nav |

### Documentation Files

| File | Purpose |
|------|---------|
| `llm_modes.md:1` | AI prompt modes documentation |
| `SECURITY_FIXES_APPLIED.md:1` | Security changelog |
| `chat-widget-test.html:1` | Chatbot testing page |

---

## Code Patterns & Conventions

### Server Actions Pattern
All data mutations use Next.js Server Actions (src/actions/**)

```typescript
'use server'

export async function createDomain(data: DomainInput) {
  const user = await currentUser()
  if (!user) throw new Error('Unauthorized')

  return await client.domain.create({
    data: {
      ...data,
      userId: user.id,
    }
  })
}
```

### Error Handling

**API Routes**:
```typescript
try {
  // ... logic
} catch (error: any) {
  devError('[Route Name]', error)
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**Server Actions**:
```typescript
try {
  // ... logic
  return { success: true, data }
} catch (error) {
  return { success: false, error: error.message }
}
```

### Logging Conventions (src/lib/utils.ts:1)

```typescript
devLog('[Component] ✅ Success message')
devError('[Component] ❌ Error:', error)
devLog('[Component]   └─ Nested detail')
devLog('[Component] 🔍 Search started')
devLog('[Component] ⚡ Performance: 123ms')
```

**Emoji Prefixes**:
- ✅ Success
- ❌ Error
- ⚠️ Warning
- 🔍 Search/Query
- ⚡ Performance
- 📧 Email
- 👤 User
- 🤖 AI
- 🔗 Link/Connection
- 🆕 New
- 🔄 Update

### React Hooks Pattern

**Custom hooks** (src/hooks/**):
```typescript
export function useChatbot(domainId: string) {
  const [state, setState] = useState(initialState)

  const actions = {
    sendMessage: async (message: string) => {
      // ... implementation
    }
  }

  return { state, actions }
}
```

### Component Organization

```typescript
// 1. Imports
import { } from 'react'
import { } from '@/components/ui'
import { } from '@/lib'

// 2. Types
type Props = { }

// 3. Component
export function Component({ }: Props) {
  // 3a. Hooks
  const [state, setState] = useState()

  // 3b. Derived state
  const computed = useMemo(() => { }, [deps])

  // 3c. Effects
  useEffect(() => { }, [deps])

  // 3d. Handlers
  const handleClick = () => { }

  // 3e. Render
  return (
    <div></div>
  )
}
```

### Prisma Query Patterns

**Always select specific fields** (avoid `select: true`):
```typescript
const domain = await client.domain.findUnique({
  where: { id },
  select: {
    name: true,
    chatBot: {
      select: {
        mode: true,
        brandTone: true,
      }
    }
  }
})
```

**Use transactions for multi-step operations**:
```typescript
await client.$transaction([
  client.customer.create({ data: customerData }),
  client.chatRoom.create({ data: chatRoomData }),
])
```

### TypeScript Conventions

- **Strict mode enabled**
- **No `any` types** (prefer `unknown` + type guards)
- **Props as named exports**: `type Props = { }`
- **Zod schemas for validation**: `src/schemas/**`

### Styling Conventions

- **TailwindCSS utility-first**
- **Shadcn/ui components** - Customizable primitives
- **Neobrutalism design system** - Bold borders, shadows, vibrant colors
- **Responsive breakpoints**: `w900`, `w500` (custom)
- **Dark mode**: `dark:` prefix with `next-themes`

---

## Performance Optimizations

### 1. Domain Caching (src/app/api/bot/stream/route.ts:24)
```typescript
const DOMAIN_CACHE_TTL_MS = 60_000  // 60 seconds
const DOMAIN_CACHE_CAPACITY = 100
const domainCache = new Map<string, { value: DomainConfig; expires: number }>()
```
**Impact**: Reduces DB queries by ~85% (based on cache hit ratio logs)

### 2. Streaming Responses
- **TTFT**: Time to first token ~150-300ms
- **Max tokens**: 800 (limits cost + latency)
- **SSE format**: Efficient byte streaming

### 3. Parallel Queries
```typescript
const [domain, billing] = await Promise.all([
  client.domain.findUnique({ ... }),
  client.billings.findUnique({ ... }),
])
```

### 4. Lazy Embedding Generation
- Embeddings generated on-demand (not on upload)
- Background processing with status tracking
- Fallback to truncated KB if not ready

### 5. Image Optimization (next.config.mjs:4)
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'ucarecdn.com' },
    { protocol: 'https', hostname: 'tempfile.redpandaai.co' },
  ]
}
```

---

## Security Measures

### 1. Environment Variable Protection
- **Server-only secrets**: Never in `NEXT_PUBLIC_*`
- **API key proxying**: `/api/upload` hides KIE_API_KEY from client

### 2. Webhook Verification (src/app/api/dodo/webhook/route.ts:1)
```typescript
import { Webhook } from 'standardwebhooks'

const wh = new Webhook(process.env.DODO_WEBHOOK_SECRET!)
const payload = wh.verify(requestBody, headers)
```

### 3. Authentication Middleware (src/middleware.ts:1)
- Clerk session verification
- Route-level protection
- Public route allowlist

### 4. SQL Injection Prevention
- **Prisma ORM**: Parameterized queries
- **No raw SQL**: Except migration scripts

### 5. XSS Prevention
- React automatic escaping
- `dangerouslySetInnerHTML` avoided
- User input sanitized

### 6. Rate Limiting
- **Message credits**: Plan-based limits
- **429 responses**: When credits exhausted

### 7. CORS & CSP
- Default Next.js security headers
- Restricted image sources

---

## Testing Strategy

### Current Test Files
- `chat-widget-test.html:1` - Manual chatbot widget testing
- `test-chatbot.html:1` - Legacy chatbot tests

### Recommended Test Coverage

1. **Unit Tests**
   - `lib/utils.ts` - Email extraction, utilities
   - `lib/promptBuilder.ts` - Prompt generation
   - `lib/plans.ts` - Billing logic

2. **Integration Tests**
   - API routes (`/api/bot/stream`, `/api/upload`)
   - Server actions (domain creation, settings updates)

3. **E2E Tests**
   - User sign up flow
   - Domain creation
   - Chatbot conversation
   - Subscription upgrade
   - Live mode handoff

---

## Deployment Checklist

### Pre-deployment
- [ ] Set all environment variables in Vercel
- [ ] Run `npx prisma migrate deploy` (production DB)
- [ ] Execute `supabase-vector-setup.sql` (if using Supabase)
- [ ] Configure Clerk production keys
- [ ] Update Dodo webhook URL to production
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Test chatbot embedding on external site

### Post-deployment
- [ ] Verify Clerk authentication works
- [ ] Test chatbot conversation flow
- [ ] Confirm Pusher real-time updates
- [ ] Test subscription checkout
- [ ] Verify webhook deliveries (Dodo dashboard)
- [ ] Check OpenAI API usage
- [ ] Monitor error logs (Vercel dashboard)

---

## Common Issues & Solutions

### Issue: Prisma Client Not Generated
**Solution**:
```bash
npx prisma generate
```

### Issue: Canvas Module Error (PDF parsing)
**Solution**: Already handled in `next.config.mjs:22`
```javascript
config.resolve.alias.canvas = false
```

### Issue: Embeddings Not Working
**Solution**:
1. Check Supabase has pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. Verify `DIRECT_URL` is set (migrations need direct connection)
3. Check `ChatBot.hasEmbeddings = true` in database

### Issue: Live Mode Not Updating
**Solution**:
1. Verify Pusher credentials (server + client)
2. Check browser console for Pusher connection errors
3. Ensure channel name format: `presence-domain-{domainId}`

### Issue: 429 Message Limit Errors
**Solution**:
1. Check `Billings.messagesUsed` vs `messageCredits`
2. Verify `messagesResetAt` is in the future
3. Test credit reset logic with past `messagesResetAt` date

---

## Future Enhancements

### Planned Features
- [ ] Anthropic Claude integration (API key in .env.example:63)
- [ ] Multi-language chatbot (i18n)
- [ ] Voice chat support
- [ ] Advanced analytics dashboard
- [ ] A/B testing for chatbot modes
- [ ] Custom LLM model selection
- [ ] WhatsApp/SMS integrations
- [ ] CRM integrations (Salesforce, HubSpot)

### Scalability Improvements
- [ ] Redis caching layer (replace in-memory domain cache)
- [ ] Queue system for embedding generation (BullMQ)
- [ ] Separate microservice for AI inference
- [ ] Database read replicas
- [ ] CDN for chatbot widget assets

---

## Contributing Guidelines

### Code Style
- Follow existing patterns
- Use TypeScript strict mode
- Add JSDoc comments for complex functions
- Keep components < 200 lines (extract sub-components)

### Commit Messages
```
feat: Add new chatbot mode
fix: Resolve race condition in customer creation
refactor: Extract prompt builder to lib
docs: Update claude.md with new API
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

---

## Support & Resources

### Documentation Links
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Pusher Docs](https://pusher.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Internal Documentation
- `llm_modes.md:1` - AI prompt mode specifications
- `SECURITY_FIXES_APPLIED.md:1` - Security patch history
- `.env.example:1` - Environment variable reference

### Project Metrics
- **Lines of Code**: ~23,131 TypeScript/TSX
- **Database Models**: 14 core models
- **API Routes**: 3 main endpoints
- **Components**: 30+ reusable components
- **Server Actions**: 50+ action functions
- **Custom Hooks**: 20+ hooks

---

## Changelog

### Recent Updates
- **Oct 17, 2025**: Improved chatbot UI with auto-scroll fixes (commit d78eab2)
- **Oct 17, 2025**: Removed duplicate Jump button from tabs (commit cbff15d)
- **Oct 17, 2025**: Refined chatbot UI with consistent sizing (commit 174901a)
- **Oct 17, 2025**: Repositioned close button, improved auto-scroll (commit 10a6027)
- **Oct 17, 2025**: Added "Jump to latest" button with smart scroll detection (commit f5a4990)

### Security Fixes
See `SECURITY_FIXES_APPLIED.md:1` for detailed security patch history.

---

## License

*Add license information here*

---

## Contact

*Add contact/support information here*

---

**End of Documentation**

*This documentation is generated and maintained by Claude Code.*
*Last updated: October 17, 2025*
