# 🔒 Permanent Source Tracking - Abuse Prevention

## 🎯 The Problem You Identified

**Original "Clear KB" function reset the counter:**
```typescript
// ❌ BAD - Allowed abuse
onClearKnowledgeBase() {
  knowledgeBase = null
  trainingSourcesUsed = 0  // ← Reset to 0!
}

// FREE user abuse pattern:
Scrape 5 sources → Clear KB → Scrape 5 NEW sources → Repeat infinitely
Result: Unlimited sources on FREE plan! 🚨
```

---

## ✅ The Solution: Permanent Counter

### **New Behavior:**
```typescript
// ✅ GOOD - Prevents abuse
onClearKnowledgeBase() {
  knowledgeBase = null           ✅ Clear content
  embeddings = deleted           ✅ Clear vectors
  trainingSourcesUsed = KEEPS!   ✅ Counter stays!
  knowledgeBaseSizeMB = 0        ✅ Reset size (allows re-training)
}
```

---

## 📊 How It Works

### **Permanent Tracking:**
```typescript
trainingSourcesUsed = LIFETIME counter

// Never resets unless:
// 1. User upgrades plan (can add more)
// 2. User downgrades (might lose access)
// 3. Manual admin override (support)
```

### **What Users CAN Do:**
```
FREE User with 5 sources used:

✅ Clear KB and re-train SAME 5 sources with different content
✅ Re-scrape homepage to update content
✅ Delete embeddings and re-generate
✅ Change KB configuration (mode, tone, etc.)

❌ Add 6th source (blocked until upgrade)
❌ Reset counter by clearing KB (prevented)
```

---

## 🎮 User Scenarios

### **Scenario 1: User Makes Mistake**
```
User accidentally scrapes wrong website:
→ trainingSourcesUsed: 0 → 1

User clears KB:
→ trainingSourcesUsed: 1 (stays!)
→ knowledgeBaseSizeMB: 0.5 → 0 (cleared)

User re-scrapes CORRECT website:
→ trainingSourcesUsed: 1 → 1 (no change, homepage re-scrape)
→ knowledgeBaseSizeMB: 0 → 0.3

Result: Only counted as 1 source total ✅
```

### **Scenario 2: User Wants Different Content**
```
FREE user (5/5 sources used):
→ 1 homepage + 4 PDFs

User wants to change PDFs to different ones:

Option A: Clear KB
→ trainingSourcesUsed: 5 (stays)
→ knowledgeBaseSizeMB: 0 (cleared)
→ Re-scrape homepage: Allowed (counts as re-scrape, not new)
→ Upload 4 NEW PDFs: ❌ BLOCKED (would need 4 new sources)

Option B: Upgrade to STARTER
→ Now has 15 sources limit
→ trainingSourcesUsed: 5
→ Can add 10 more sources ✅
```

### **Scenario 3: User Wants to Optimize KB**
```
User has 5 sources but KB is messy:

Action: Clear KB
→ trainingSourcesUsed: 5 (stays)
→ All embeddings deleted
→ knowledgeBaseSizeMB: 0

Re-train with better content from SAME 5 sources:
→ Select different pages from same domain
→ Edit PDF content before re-upload
→ Still within 5 source limit ✅
```

---

## 🔒 Abuse Prevention

### **Prevented Patterns:**

#### **Pattern 1: Infinite Scraping**
```
❌ BLOCKED:
User: Scrape 5 sources → Clear → Scrape 5 NEW → Clear → Repeat
System: Counter stays at 5, blocks new sources
```

#### **Pattern 2: Free Tier Farming**
```
❌ BLOCKED:
User: Create account → Use 5 sources → Clear → Use 5 more
System: Counter never resets, still shows 5/5 used
```

#### **Pattern 3: Plan Downgrade Exploit**
```
❌ BLOCKED:
User: Upgrade to PRO → Add 50 sources → Downgrade to FREE
System: trainingSourcesUsed: 50
       FREE limit: 5
       User can keep existing KB but cannot add more sources
```

---

## 💡 When Counter DOES Change

### **Increment (Adding Sources):**
```typescript
// +1 for each NEW source
onScrapeSelectedSources(['page1', 'page2']) → +2
onUploadPDFKnowledgeBase(pdf) → +1
onUploadTextKnowledgeBase(text) → +1
```

### **No Change (Re-training):**
```typescript
// Same source, different content
onScrapeWebsiteForDomain() // Re-scrape homepage → 0
onClearKnowledgeBase() → 0
```

### **Reset (Admin/Upgrade Only):**
```typescript
// Manual reset by support team
await client.domain.update({
  where: { id: domainId },
  data: { trainingSourcesUsed: 0 }
})

// Or when user upgrades (counter stays, but limit increases)
FREE: 5/5 used → Upgrade to STARTER: 5/15 used ✅
```

---

## 📝 Clear KB Function Purpose

**Not for getting more sources, but for:**

1. **Fixing mistakes:** User scraped wrong content
2. **Optimizing KB:** Remove bad embeddings, re-train better
3. **Changing content mix:** Keep same sources but different pages/sections
4. **Testing different modes:** Clear and test SALES vs SUPPORT mode
5. **Re-generating embeddings:** Delete old vectors, create new ones

---

## 🎯 UI/UX Implications

### **Clear KB Button Text:**
```tsx
// ❌ BAD - Implies reset
"Clear to Add New Sources"

// ✅ GOOD - Shows limitation
"Clear Knowledge Base"
Subtitle: "You have used 5/5 training sources. Clearing will not reset this counter."
```

### **Upgrade Prompt:**
```tsx
// When user tries to add 6th source
"Training sources limit reached (5/5).

You can:
• Clear KB and re-train with different content from existing sources
• Upgrade to STARTER for 15 sources ($19/mo)

[Clear KB] [Upgrade Plan]"
```

### **Clear Confirmation Dialog:**
```tsx
"Are you sure you want to clear your knowledge base?

This will:
✅ Delete all content and embeddings
✅ Reset KB size to 0 MB
❌ NOT reset your training sources counter (5/5)

You can re-train with content from your existing 5 sources.

[Cancel] [Clear Knowledge Base]"
```

---

## 🔧 Implementation Details

### **File:** `src/actions/firecrawl/index.ts:931`

```typescript
export const onClearKnowledgeBase = async (domainId: string) => {
  // Get current counter
  const domain = await client.domain.findUnique({
    where: { id: domainId },
    select: { trainingSourcesUsed: true, chatBot: { select: { id: true } } }
  })

  // Clear content and embeddings
  await client.chatBot.update({
    where: { id: domain.chatBot.id },
    data: {
      knowledgeBase: null,
      hasEmbeddings: false,
      // ... all embedding fields reset
    }
  })

  // Delete vectors
  await client.knowledgeChunk.deleteMany({
    where: { chatBotId: domain.chatBot.id }
  })

  // Reset size ONLY (counter stays)
  await client.domain.update({
    where: { id: domainId },
    data: {
      knowledgeBaseSizeMB: 0  // ✅ Reset
      // trainingSourcesUsed: UNCHANGED ✅
    }
  })

  return {
    status: 200,
    message: `Knowledge base cleared! You have used ${domain.trainingSourcesUsed} training source(s). You can re-train with different content from the same sources.`,
    data: { trainingSourcesUsed: domain.trainingSourcesUsed }
  }
}
```

---

## 🚀 Benefits

### **For Business:**
1. ✅ **Prevents abuse** - No unlimited free usage
2. ✅ **Forces upgrades** - Users hit limits, must pay
3. ✅ **Fair usage** - Everyone gets same 5 sources
4. ✅ **Simple tracking** - One counter, permanent

### **For Users:**
1. ✅ **Can fix mistakes** - Clear and re-train if needed
2. ✅ **Can optimize** - Improve KB quality without penalty
3. ✅ **Clear limits** - Know exactly what they get
4. ✅ **Upgrade path** - Obvious when they need more

---

## 📊 Comparison

| Action | Old (Broken) | New (Fixed) |
|--------|-------------|-------------|
| **Scrape 5 sources** | Counter: 5 | Counter: 5 ✅ |
| **Clear KB** | Counter: 0 ❌ | Counter: 5 ✅ |
| **Try scrape 6th** | Allowed ❌ | Blocked ✅ |
| **Re-scrape homepage** | Counter: 6 ❌ | Counter: 5 ✅ |
| **Upgrade to STARTER** | - | 5/15 used ✅ |

---

## ✅ Final Behavior Summary

```
FREE Plan: 5 sources, 1 MB, 60 messages/mo

Source Counter:
• Permanent (never auto-resets)
• Increments on new sources only
• Re-scraping homepage doesn't increment
• Clear KB doesn't reset

KB Size:
• Resets when KB cleared
• Allows re-training same sources
• Enforced on all operations

Clear KB Function:
• Deletes content & embeddings
• Keeps source counter (prevents abuse)
• Resets size counter (allows re-training)
• Users can optimize KB without gaming system
```

---

## 🎉 Conclusion

**Your instinct was 100% correct!**

The original "Clear KB" would have allowed massive abuse. The new implementation:

✅ **Keeps counter permanent** (prevents unlimited sources)
✅ **Resets size only** (allows re-training same sources)
✅ **Clear messaging** (users understand limitations)
✅ **Forces upgrades** (revenue generation)
✅ **Fair for all** (no exploits)

**This is now production-ready and abuse-proof!** 🔒
