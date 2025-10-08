# 🚀 Quick Start Guide - Deploy in 10 Minutes

**Everything is ready to go!** Just follow these steps:

---

## ✅ **Step 1: Install Dependencies** (2 min)

```bash
# Install PDF library
npm install pdf-parse

# Install missing shadcn components
npx shadcn-ui@latest add tabs tooltip progress badge
```

---

## ✅ **Step 2: Verify Environment** (1 min)

Check your `.env` file has:
```bash
FIRECRAWL_API_KEY=fc-your-key-here
FIRECRAWL_API_URL=https://api.firecrawl.dev/v2
```

Get free API key: https://firecrawl.dev

---

## ✅ **Step 3: Replace UI Component** (2 min)

**Option A: Replace (Recommended)**
```bash
cd src/components/settings
mv knowledge-base-viewer.tsx knowledge-base-viewer-old.tsx
mv knowledge-base-viewer-v2.tsx knowledge-base-viewer.tsx
```

**Option B: Test Side-by-Side**
```tsx
// In your settings page:
import KnowledgeBaseViewerV2 from './knowledge-base-viewer-v2'

<KnowledgeBaseViewerV2
  domainId={domain.id}
  domainName={domain.name}
  knowledgeBase={chatBot.knowledgeBase}
  status={chatBot.knowledgeBaseStatus}
  updatedAt={chatBot.knowledgeBaseUpdatedAt}
  plan={user.subscription?.plan || 'FREE'}
  trainingSourcesUsed={domain.trainingSourcesUsed}
  trainingSourcesLimit={getPlanLimits(plan).trainingSources}
  kbSizeMB={domain.knowledgeBaseSizeMB}
  kbSizeLimit={getPlanLimits(plan).knowledgeBaseMB}
/>
```

---

## ✅ **Step 4: Update Server Action** (2 min)

**File:** `src/actions/settings/index.ts`

Find `onGetCurrentDomainInfo` and add these fields:

```typescript
select: {
  id: true,
  name: true,
  icon: true,
  // ADD THESE TWO:
  trainingSourcesUsed: true,
  knowledgeBaseSizeMB: true,
  chatBot: {
    select: {
      // ... existing fields
    }
  }
}
```

---

## ✅ **Step 5: Test Locally** (2 min)

```bash
npm run dev
```

Visit: `http://localhost:3000/settings/[your-domain]`

**Test Checklist:**
- [ ] See 3 tabs (Select Pages, Quick Scrape, Upload)
- [ ] Plan limits display (Sources: 0/5, KB: 0.00/1 MB)
- [ ] Click "Select Training Sources" → Dialog opens
- [ ] Try uploading a .txt file
- [ ] Check progress bars render

---

## ✅ **Step 6: Deploy** (1 min)

```bash
git add .
git commit -m "feat: Add training sources, PDF support, improved KB UI"
git push origin main
```

---

## 🎉 **Done!**

Your users will now see:
- ✅ Clear 3-tab interface
- ✅ Training sources selector
- ✅ PDF upload support
- ✅ Live usage tracking
- ✅ Step-by-step guidance

---

## 🐛 **Troubleshooting**

### "Tabs not rendering"
```bash
npx shadcn-ui@latest add tabs
```

### "Progress bars missing"
```bash
npx shadcn-ui@latest add progress
```

### "Tooltip not working"
```bash
npx shadcn-ui@latest add tooltip
```

### "TrainingSourcesSelector not found"
File should exist at:
```
src/components/settings/training-sources-selector.tsx
```

### "Props undefined"
Update server action to fetch:
```typescript
trainingSourcesUsed: true,
knowledgeBaseSizeMB: true,
```

---

## 📚 **Full Documentation**

- **IMPLEMENTATION_COMPLETE.md** - Full summary
- **UI_INTEGRATION_GUIDE.md** - Detailed integration
- **ENFORCEMENT_IMPLEMENTATION.md** - Technical details
- **BEFORE_AFTER_COMPARISON.md** - UI improvements

---

## ⚡ **TL;DR**

```bash
# 1. Install
npm install pdf-parse
npx shadcn-ui@latest add tabs tooltip progress badge

# 2. Replace component
cd src/components/settings
mv knowledge-base-viewer.tsx knowledge-base-viewer-old.tsx
mv knowledge-base-viewer-v2.tsx knowledge-base-viewer.tsx

# 3. Update server action (add 2 fields to select)
# trainingSourcesUsed, knowledgeBaseSizeMB

# 4. Test
npm run dev

# 5. Deploy
git add . && git commit -m "feat: Improved KB UI" && git push
```

**That's it! 🚀**
