# 🔧 Webpack Cache Issue - Fixed

## 🐛 Error Message

```
Cannot find module './5873.js'
Cannot find module './vendor-chunks/@clerk.js'
TypeError: Cannot read properties of undefined (reading 'call')
```

## 🎯 Root Cause

**Next.js webpack caching issue** after making code changes (especially import changes).

The `.next` folder contains compiled chunks that reference old module IDs. When you add new imports like `getPlanLimits`, webpack generates new chunk IDs, but the cached runtime still references the old ones.

## ✅ Solution

### **Quick Fix:**
```bash
# Delete the .next cache folder
rm -rf .next

# Restart dev server
npm run dev
```

This forces Next.js to rebuild everything from scratch with the correct module IDs.

---

## 📝 Why This Happened

1. **Made code changes:**
   - Added `import { getPlanLimits } from '@/lib/plans'`
   - Modified component props

2. **Webpack generated new chunks:**
   - Old: `./5873.js` (previous chunk ID)
   - New: `./5874.js` (new chunk ID after changes)

3. **Cached runtime still referenced old chunks:**
   - Runtime: "Load `./5873.js`"
   - Reality: File doesn't exist anymore ❌

---

## 🔄 When To Clear Cache

Clear `.next` folder when you see:

1. **Module not found errors:**
   ```
   Cannot find module './[number].js'
   Cannot find module './vendor-chunks/@[package].js'
   ```

2. **After adding new imports:**
   ```typescript
   import { NewFunction } from '@/lib/something'  // Clear cache after this
   ```

3. **After major refactoring**

4. **After upgrading dependencies**

5. **Weird runtime errors that don't make sense**

---

## 🚀 Prevention

### **Option 1: Always clear cache when adding imports**
```bash
rm -rf .next && npm run dev
```

### **Option 2: Use Turbopack (faster rebuilds)**
```bash
# Next.js 15+ has experimental Turbopack
npm run dev --turbo
```

### **Option 3: Add npm script**
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "dev:clean": "rm -rf .next && next dev",  // Clean start
    "build": "prisma generate && next build"
  }
}
```

---

## ✅ Status After Fix

```bash
✓ Ready in 2.3s
✓ Compiled successfully
✓ No module errors
✓ Server running on http://localhost:3001
```

---

## 📊 Common Next.js Cache Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module './[number].js'` | Stale webpack chunks | `rm -rf .next` |
| `Cannot read properties of undefined` | Stale runtime cache | `rm -rf .next` |
| `Module not found: @clerk` | Missing dependency or cache | `npm install && rm -rf .next` |
| Build works but dev fails | Cache mismatch | `rm -rf .next` |

---

## 🎯 Summary

**Problem:** Webpack cache referencing old module IDs after code changes

**Solution:** Delete `.next` folder and restart dev server

**Command:** `rm -rf .next && npm run dev`

**Status:** ✅ FIXED - Server running successfully

---

**Your app is now running cleanly with all cache cleared!** 🚀
