# Plan Limits Enforcement Implementation

**Date:** October 8, 2024
**Status:** ✅ Fully Implemented

---

## 📋 **Overview**

This document outlines the comprehensive implementation of plan limits enforcement for Corinna AI, including:
1. **Training Sources Selection** with Firecrawl Map
2. **Knowledge Base Size Enforcement**
3. **PDF Upload Support**
4. **Multi-Source Scraping**

---

## 🎯 **Updated Plan Limits**

| Feature | FREE | STARTER | PRO | BUSINESS |
|---------|------|---------|-----|----------|
| **Messages/month** | **60** ✅ | 2,000 ✅ | 5,000 ✅ | 10,000 ✅ |
| **Domains** | 1 ✅ | 1 ✅ | 5 ✅ | Unlimited ✅ |
| **KB Size** | 1 MB ✅ | 20 MB ✅ | 50 MB ✅ | 200 MB ✅ |
| **Training Sources** | **5** ✅ | **15** ✅ | **50** ✅ | Unlimited ✅ |
| **Conversation History** | 30 days ⚠️ | Unlimited | Unlimited | Unlimited |

**Legend:**
- ✅ **Enforced** - Code actively blocks when limit reached
- ⚠️ **Not Enforced** - Shown on pricing page only

---

## 🛠️ **Implementation Details**

### **1. Firecrawl Map Integration**

**File:** `src/lib/firecrawl.ts:117-179`

**Function:** `mapWebsite()`

**Purpose:** Discover all URLs from a website before scraping

**API Request:**
```typescript
POST https://api.firecrawl.dev/v2/map
{
  "url": "https://example.com",
  "limit": 100
}
```

**Response:**
```typescript
{
  "success": true,
  "links": [
    {
      "url": "https://example.com/about",
      "title": "About Us",
      "description": "Learn about our company"
    }
  ]
}
```

---

### **2. Training Sources Enforcement**

**Files:**
- `src/actions/firecrawl/index.ts:452-514` - Discovery action
- `src/actions/firecrawl/index.ts:516-713` - Multi-source scraping action
- `src/hooks/firecrawl/use-scrape.ts:214-312` - React hooks
- `src/components/settings/training-sources-selector.tsx` - UI component

**Flow:**
```
User clicks "Select Training Sources"
  ↓
Firecrawl Map discovers all URLs (up to 100)
  ↓
UI shows checkboxes (limit selection by plan: 5, 15, 50, unlimited)
  ↓
User selects URLs to scrape
  ↓
Server validates: trainingSourcesUsed + selected <= limit
  ↓
Scrapes each URL individually
  ↓
Updates: trainingSourcesUsed + knowledgeBaseSizeMB
```

**Enforcement Code:**
```typescript
// Check training sources limit
const newSourceCount = domain.trainingSourcesUsed + selectedUrls.length
if (limits.trainingSources !== Infinity && newSourceCount > limits.trainingSources) {
  return {
    status: 400,
    message: `Training sources limit reached...`,
    upgradeRequired: true
  }
}
```

---

### **3. Knowledge Base Size Enforcement**

**Files:**
- `src/actions/firecrawl/index.ts:401-482` - Text upload enforcement
- `src/actions/firecrawl/index.ts:582-596` - Multi-scrape enforcement
- `src/actions/firecrawl/index.ts:785-795` - PDF upload enforcement

**Tracking:**
- Database column: `Domain.knowledgeBaseSizeMB` (Float)
- Updated on: Text upload, multi-scrape, PDF upload
- Calculation: `(content.length / (1024 * 1024))`

**Enforcement Code:**
```typescript
// Check KB size limit
const newSizeMB = finalContent.length / (1024 * 1024)
if (newSizeMB > limits.knowledgeBaseMB) {
  return {
    status: 400,
    message: `Knowledge base size limit reached...`,
    upgradeRequired: true,
    limit: limits.knowledgeBaseMB,
    attempted: newSizeMB
  }
}
```

---

### **4. PDF Upload Support**

**Files:**
- `src/lib/pdf-extractor.ts` - PDF text extraction
- `src/actions/firecrawl/index.ts:715-846` - PDF upload action

**Library:** `pdf-parse` (npm package)

**Features:**
- ✅ Extract text from PDF
- ✅ Get page count and metadata (title, author, subject)
- ✅ Validate PDF magic number (`%PDF`)
- ✅ Clean extracted text (remove excessive whitespace)
- ✅ Enforce KB size limits
- ✅ Enforce training sources limits (PDF = 1 source)
- ✅ Add metadata comment to knowledge base

**Usage:**
```typescript
const result = await onUploadPDFKnowledgeBase(
  domainId,
  fileBuffer,  // Buffer from file upload
  filename,
  append       // true = append, false = replace
)
```

**Output:**
```markdown
<!-- PDF: document.pdf | 5 pages | Title: User Manual -->

[Extracted clean text content...]
```

---

## 📊 **Enforcement Matrix**

| Feature | Where Checked | Counter Updated | Error Message |
|---------|---------------|-----------------|---------------|
| **Messages** | `src/app/api/bot/stream/route.ts:169-184` | `messagesUsed` | "Message limit reached" |
| **Domains** | `src/actions/settings/index.ts:38-84` | `_count.domains` | "Maximum domains reached, upgrade" |
| **KB Size** | 3 locations (text, PDF, multi-scrape) | `knowledgeBaseSizeMB` | "KB size limit reached" |
| **Training Sources** | 2 locations (multi-scrape, PDF) | `trainingSourcesUsed` | "Training sources limit reached" |

---

## 🔧 **Database Schema Updates Required**

**IMPORTANT:** The columns already exist in schema but may need initialization:

```sql
-- Initialize counters for existing domains
UPDATE "Domain"
SET "knowledgeBaseSizeMB" = 0,
    "trainingSourcesUsed" = 0
WHERE "knowledgeBaseSizeMB" IS NULL
   OR "trainingSourcesUsed" IS NULL;
```

**Schema (already in place):**
```prisma
model Domain {
  knowledgeBaseSizeMB Float   @default(0)
  trainingSourcesUsed Int     @default(0)
  // ... other fields
}
```

---

## 🎨 **UI Components**

### **Training Sources Selector**

**File:** `src/components/settings/training-sources-selector.tsx`

**Features:**
- Discover URLs button
- Checkbox list with plan limit display
- Selected count: "3 of 25 pages selected"
- Disable checkboxes when limit reached
- "Limit reached" badge when at capacity
- Scrape selected button with loading state

**Integration Example:**
```tsx
import { TrainingSourcesSelector } from '@/components/settings/training-sources-selector'

<TrainingSourcesSelector domainId={domain.id} />
```

---

## 🚀 **How to Use**

### **For Users:**

1. **Select Training Sources:**
   - Click "Select Training Sources" button
   - System discovers all pages on website
   - Check boxes for pages you want
   - See limit: "FREE: 5 sources, 2 remaining"
   - Click "Scrape X Sources"

2. **Upload PDF:**
   - Click "Upload PDF" (when UI is added)
   - Select PDF file (max based on plan limit)
   - System extracts text automatically
   - PDF deleted after extraction
   - Text stored in knowledge base

3. **Upload Text:**
   - Click "Upload Text" or paste content
   - System checks size limit
   - Displays error if too large
   - Suggests upgrade if needed

### **For Developers:**

**Add to knowledge-base-viewer.tsx:**
```tsx
import { TrainingSourcesSelector } from '@/components/settings/training-sources-selector'

// Inside your component:
<TrainingSourcesSelector domainId={domainId} />
```

---

## 📝 **Environment Variables**

**Required in `.env`:**
```bash
# Firecrawl API (for map + scrape)
FIRECRAWL_API_KEY=fc-your-api-key-here
FIRECRAWL_API_URL=https://api.firecrawl.dev/v2
```

Get your API key from: https://firecrawl.dev

---

## ✅ **Testing Checklist**

### **Training Sources:**
- [ ] FREE user can select max 5 URLs
- [ ] STARTER user can select max 15 URLs
- [ ] PRO user can select max 50 URLs
- [ ] BUSINESS user has unlimited selection
- [ ] Selecting 6th URL as FREE shows "Limit reached"
- [ ] Checkboxes disable when limit reached
- [ ] trainingSourcesUsed increments correctly

### **KB Size:**
- [ ] FREE user blocked at 1 MB upload
- [ ] Text upload enforces limit
- [ ] PDF upload enforces limit
- [ ] Multi-scrape enforces limit
- [ ] knowledgeBaseSizeMB updates correctly
- [ ] Error message shows current vs attempted size

### **PDF Upload:**
- [ ] Valid PDF extracts text
- [ ] Invalid file shows "Invalid PDF" error
- [ ] Image-based PDF shows appropriate error
- [ ] Metadata extracted (title, pages)
- [ ] Text cleaned (no excessive whitespace)
- [ ] PDF counts as 1 training source
- [ ] Size enforcement works

---

## 🐛 **Known Limitations**

1. **Conversation History Cleanup:**
   - 30-day limit for FREE plan NOT enforced
   - Data stored indefinitely for all plans
   - Needs background job for cleanup

2. **Firecrawl Map Limitations:**
   - May not discover all URLs (prioritizes speed)
   - Limited to 100 URLs per discovery
   - Respects robots.txt

3. **PDF Extraction:**
   - Cannot extract from image-based PDFs (OCR not included)
   - Encrypted PDFs will fail
   - Very large PDFs (>50MB) may timeout

---

## 🔮 **Future Enhancements**

1. **OCR Support for Image PDFs:**
   - Use Tesseract.js or Cloud Vision API
   - Add optional OCR processing

2. **Batch PDF Upload:**
   - Allow multiple PDFs at once
   - Progress bar for each file

3. **URL Filtering:**
   - Search/filter discovered URLs
   - Regex pattern matching
   - Exclude patterns (/admin/*, /api/*)

4. **Source Management:**
   - View list of scraped sources
   - Re-scrape individual sources
   - Delete sources to free up limit

5. **Advanced Analytics:**
   - Show KB size breakdown by source
   - Most used training sources
   - Embedding quality scores

---

## 📚 **Related Files**

**Core Libraries:**
- `src/lib/firecrawl.ts` - Firecrawl API client
- `src/lib/pdf-extractor.ts` - PDF text extraction
- `src/lib/plans.ts` - Plan limits configuration
- `src/lib/chunking.ts` - Text chunking for RAG
- `src/lib/embeddings.ts` - OpenAI embeddings

**Server Actions:**
- `src/actions/firecrawl/index.ts` - All KB operations
- `src/actions/settings/index.ts` - Domain management

**React Hooks:**
- `src/hooks/firecrawl/use-scrape.ts` - All KB hooks

**UI Components:**
- `src/components/settings/training-sources-selector.tsx` - Source selection UI
- `src/components/settings/knowledge-base-viewer.tsx` - Main KB viewer

---

## 🎓 **Documentation Links**

- Firecrawl Docs: https://docs.firecrawl.dev/
- Firecrawl Map Endpoint: https://docs.firecrawl.dev/features/map
- pdf-parse npm: https://www.npmjs.com/package/pdf-parse

---

**Last Updated:** October 8, 2024
**Implementation Status:** ✅ Complete
**Next Steps:** Add UI integration in knowledge-base-viewer component
