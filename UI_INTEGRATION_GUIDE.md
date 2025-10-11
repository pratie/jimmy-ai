# Knowledge Base UI Integration Guide

**Created:** October 8, 2024
**Component:** `knowledge-base-viewer-v2.tsx`
**Status:** Ready for Integration

---

## 🎯 **What's New**

I've created a completely redesigned Knowledge Base UI (`knowledge-base-viewer-v2.tsx`) with:

✅ **Better User Onboarding** - Clear, step-by-step guidance
✅ **Training Sources Selector** - Integrated seamlessly
✅ **PDF Upload Support** - Ready to use
✅ **Usage Tracking** - Live progress bars for limits
✅ **Tabbed Interface** - 3 clear options for adding content
✅ **Visual Feedback** - Progress steps, badges, tooltips

---

## 📸 **UI Features Overview**

### **1. Empty State (No Knowledge Base)**

**What Users See:**
```
┌─────────────────────────────────────────────┐
│ 📊 Build Your Knowledge Base                │
│ Train your AI chatbot with content...       │
├─────────────────────────────────────────────┤
│                                              │
│ Training Sources: 0 / 5    [████░░░░░░]    │
│ KB Size: 0.00 / 1 MB       [░░░░░░░░░░]    │
│                                              │
│ ━━━ Choose one or more ways ━━━             │
│                                              │
│ [Select Pages] [Quick Scrape] [Upload]      │
│                                              │
│ ┌─ RECOMMENDED ──────────────────┐          │
│ │ ✨ Select Specific Pages        │          │
│ │ • See all pages before scraping │          │
│ │ • Select only relevant content  │          │
│ │                                  │          │
│ │ [🔗 Select Training Sources]    │          │
│ └──────────────────────────────────┘          │
└─────────────────────────────────────────────┘
```

**Features:**
- **Plan Limits Display** - Shows remaining sources and KB size
- **Help Icons** - Tooltips explain what each metric means
- **3 Tabs:**
  - **Select Pages** (Recommended) - Training Sources Selector
  - **Quick Scrape** - One-click homepage scrape
  - **Upload Files** - .txt and .pdf upload

---

### **2. With Knowledge Base (Active)**

```
┌─────────────────────────────────────────────┐
│ ✓ Knowledge Base Active                     │
│ 0.25 MB • 1,234 characters • Updated 2m ago │
├─────────────────────────────────────────────┤
│ [✓ Content Added] [Add More] [Train AI]    │
│                                              │
│ Sources: 2/5 [████░░░░░░]  50MB / 1MB      │
│                                              │
│ [🔗 Select Training Sources] [📤 Add More]  │
│                                              │
│ ┌─ Content Preview ───────────────┐         │
│ │ # Welcome to Our Platform       │         │
│ │ We offer...                      │         │
│ │ [Show More →]                    │         │
│ └──────────────────────────────────┘         │
└─────────────────────────────────────────────┘
```

**Features:**
- **Progress Steps** - Visual checklist (Content → Add More → Train)
- **Usage Badges** - Color-coded (green < 80%, red > 80%)
- **Quick Actions** - Buttons to add more content or train
- **Live Preview** - Expandable markdown preview

---

## 🔧 **How to Integrate**

### **Option 1: Replace Existing Component (Recommended)**

**File:** `src/components/settings/knowledge-base-viewer.tsx`

```bash
# Backup is already created at:
# src/components/settings/knowledge-base-viewer-old-backup.tsx

# Replace content with v2:
mv knowledge-base-viewer-v2.tsx knowledge-base-viewer.tsx
```

**Update Props:**

The new component needs additional props:

```tsx
// OLD (current):
<KnowledgeBaseViewer
  domainId={domain.id}
  domainName={domain.name}
  knowledgeBase={chatBot.knowledgeBase}
  status={chatBot.knowledgeBaseStatus}
  updatedAt={chatBot.knowledgeBaseUpdatedAt}
/>

// NEW (v2 with limits):
<KnowledgeBaseViewer
  domainId={domain.id}
  domainName={domain.name}
  knowledgeBase={chatBot.knowledgeBase}
  status={chatBot.knowledgeBaseStatus}
  updatedAt={chatBot.knowledgeBaseUpdatedAt}
  // NEW PROPS:
  plan={user.subscription?.plan || 'FREE'}
  trainingSourcesUsed={domain.trainingSourcesUsed}
  trainingSourcesLimit={getPlanLimits(plan).trainingSources}
  kbSizeMB={domain.knowledgeBaseSizeMB}
  kbSizeLimit={getPlanLimits(plan).knowledgeBaseMB}
/>
```

---

### **Option 2: Use Side-by-Side (Testing)**

Keep both and test the new one:

```tsx
import KnowledgeBaseViewerV2 from '@/components/settings/knowledge-base-viewer-v2'

// Use v2 for testing:
<KnowledgeBaseViewerV2 {...props} />
```

---

## 📋 **Required Data Changes**

You need to fetch additional data for the component to work properly:

### **Update Server Action** (`src/actions/settings/index.ts`)

```typescript
// Update onGetCurrentDomainInfo to include limits:
export const onGetCurrentDomainInfo = async (domain: string) => {
  const userDomain = await client.user.findUnique({
    where: { clerkId: user.id },
    select: {
      subscription: {
        select: { plan: true }
      },
      domains: {
        where: { name: { contains: domain } },
        select: {
          id: true,
          name: true,
          icon: true,
          userId: true,
          products: true,
          // NEW: Add these fields
          trainingSourcesUsed: true,
          knowledgeBaseSizeMB: true,
          chatBot: {
            select: {
              id: true,
              welcomeMessage: true,
              icon: true,
              knowledgeBase: true,
              knowledgeBaseStatus: true,
              knowledgeBaseUpdatedAt: true,
              mode: true,
              brandTone: true,
              language: true,
            },
          },
        },
      },
    },
  })

  return userDomain
}
```

---

## 🎨 **UI/UX Improvements**

### **Before (Old Component):**
- ❌ Confusing "Scrape Website" with no context
- ❌ No indication of plan limits
- ❌ Text upload hidden in dialog
- ❌ No guided flow for new users

### **After (New Component):**
- ✅ **3 clear tabs** with descriptions
- ✅ **Recommended** badge on best option
- ✅ **Live usage tracking** with progress bars
- ✅ **Step-by-step guidance** (1 → 2 → 3)
- ✅ **Tooltips** for complex terms
- ✅ **Color-coded badges** (green/yellow/red)
- ✅ **Upgrade prompts** when limits reached

---

## 🧪 **Testing Checklist**

### **Empty State:**
- [ ] Plan limits display correctly (FREE: 5 sources, 1 MB)
- [ ] All 3 tabs render (Select Pages, Quick Scrape, Upload)
- [ ] Training Sources Selector button works
- [ ] Quick scrape button triggers scrape
- [ ] File upload dialog opens
- [ ] Tooltips show on hover

### **With Content:**
- [ ] Usage progress bars show correctly
- [ ] "Sources Used: 2 / 5" displays accurately
- [ ] "Add More Content" button works
- [ ] Training Sources Selector still accessible
- [ ] Content preview shows markdown
- [ ] "Show More" expands content

### **Edge Cases:**
- [ ] 100% usage shows red badge
- [ ] Unlimited plan shows "∞" correctly
- [ ] Upload enforces limits (shows error)
- [ ] Training button disabled when up-to-date
- [ ] Scraping shows loading state

---

## 🚀 **Deployment Steps**

1. **Backup Old Component** ✅ (Already done)
2. **Add Missing Imports:**
   ```bash
   # Make sure these shadcn components exist:
   - Tabs, TabsList, TabsContent, TabsTrigger
   - Tooltip, TooltipProvider, TooltipTrigger, TooltipContent
   - Progress
   - Badge

   # If missing, add them:
   npx shadcn-ui@latest add tabs tooltip progress badge
   ```

3. **Update Props in Parent Component:**
   - Add `plan`, `trainingSourcesUsed`, `trainingSourcesLimit`, `kbSizeMB`, `kbSizeLimit`

4. **Test Locally:**
   ```bash
   npm run dev
   # Navigate to /settings/[domain]
   # Test all 3 tabs and actions
   ```

5. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: Improved knowledge base UI with training sources and usage tracking"
   git push
   ```

---

## 🆘 **Troubleshooting**

### **"Tabs not rendering"**
**Fix:** Install shadcn tabs component
```bash
npx shadcn-ui@latest add tabs
```

### **"Tooltip not working"**
**Fix:** Install shadcn tooltip
```bash
npx shadcn-ui@latest add tooltip
```

### **"Progress bars missing"**
**Fix:** Install shadcn progress
```bash
npx shadcn-ui@latest add progress
```

### **"TrainingSourcesSelector not found"**
**Fix:** Ensure file exists at:
```
src/components/settings/training-sources-selector.tsx
```

### **"Plan limits showing as undefined"**
**Fix:** Update server action to fetch:
```typescript
trainingSourcesUsed: true,
knowledgeBaseSizeMB: true,
```

---

## 📚 **Component Props Reference**

```typescript
type Props = {
  domainId: string              // Domain UUID
  domainName: string             // e.g., "example.com"
  knowledgeBase: string | null   // Markdown content
  status: string | null          // 'pending' | 'scraping' | 'scraped' | 'failed'
  updatedAt: Date | null         // Last updated timestamp

  // NEW (optional with defaults):
  plan?: string                  // 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'
  trainingSourcesUsed?: number   // Current count (default: 0)
  trainingSourcesLimit?: number  // Plan limit (default: 5)
  kbSizeMB?: number             // Current size (default: 0)
  kbSizeLimit?: number          // Plan limit in MB (default: 1)
}
```

---

## 🎓 **User Flow Example**

### **Scenario: New User Adding Content**

1. **User lands on page** → Sees "Build Your Knowledge Base" card
2. **Sees 3 tabs** → Reads descriptions, "Select Pages" is recommended
3. **Clicks "Select Training Sources"** → Dialog opens
4. **Clicks "Discover URLs"** → Firecrawl finds 25 pages
5. **Sees "FREE: 5 sources, 5 remaining"** → Understands limit
6. **Checks 5 relevant pages** → Can't check 6th (disabled)
7. **Clicks "Scrape 5 Sources"** → Content added
8. **Returns to main view** → Sees "Sources: 5/5" progress bar
9. **Clicks "Train AI"** → Chatbot trained
10. **Sees green checkmarks** → All steps complete!

**Result:** User successfully onboarded with zero confusion! 🎉

---

## ✅ **Summary**

**What to Do:**
1. Replace old component with v2
2. Add new props (plan, limits, usage)
3. Update server action to fetch counters
4. Install missing shadcn components (tabs, tooltip, progress, badge)
5. Test all 3 tabs and features
6. Deploy!

**Files Changed:**
- ✅ `knowledge-base-viewer-v2.tsx` (new)
- ✅ `training-sources-selector.tsx` (already created)
- ⚠️ Need to update: Parent component props
- ⚠️ Need to update: `src/actions/settings/index.ts` (fetch limits)

**Benefits:**
- 🎯 Clear user onboarding
- 📊 Usage tracking visibility
- 🚀 All new features integrated
- 💡 Intuitive, self-explanatory UI
- ✨ Professional, modern design

---

**Questions?** Check the component code for inline comments and examples!
