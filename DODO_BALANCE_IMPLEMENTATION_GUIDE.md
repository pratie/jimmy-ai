# Dodo Payments Balance & Transactions - Implementation Guide

## 📋 Status: READY TO IMPLEMENT (When Needed)

**Last Updated:** January 30, 2025
**Estimated Time:** 2-3 hours
**Difficulty:** Easy (API integration only)

---

## 🎯 What This Does

Displays owner's earnings and transaction history from Dodo Payments on the dashboard.

### Current State (Disabled)
```
Dashboard shows:
- ✅ Conversations: 45
- ✅ Leads: 12
- ✅ Appointments: 3
- ❌ Balance: Not shown (feature disabled)
- ❌ Transactions: "Coming soon" message
```

### After Implementation
```
Dashboard shows:
- ✅ Conversations: 45
- ✅ Leads: 12
- ✅ Appointments: 3
- ✅ Balance: $1,247.50 (real-time from Dodo)
- ✅ Transactions: List of recent payments
```

---

## 🔧 Implementation Steps

### Step 1: Update Environment Variables

Add to `.env`:
```bash
# Dodo Payments API
DODO_API_KEY=your_api_key_here
NEXT_PUBLIC_DODO_API_URL=https://test.dodopayments.com  # or https://live.dodopayments.com
```

---

### Step 2: Implement getUserBalance()

**File:** `src/actions/dashboard/index.ts` (Line 79)

Replace the placeholder with:

```typescript
export const getUserBalance = async () => {
  try {
    const user = await currentUser()
    if (!user) return 0

    const connectedDodo = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { dodoMerchantId: true }
    })

    if (!connectedDodo?.dodoMerchantId) return 0

    // Fetch succeeded payments from Dodo API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DODO_API_URL}/payments?status=succeeded&page_size=100`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('[Dodo API] Balance fetch failed:', response.status)
      return 0
    }

    const data = await response.json()

    // Calculate total from all succeeded payments
    const total = data.items?.reduce((sum: number, payment: any) => {
      return sum + (payment.total_amount || 0)
    }, 0) || 0

    return total / 100 // Convert cents to dollars

  } catch (error) {
    console.error('[getUserBalance] Error:', error)
    return 0
  }
}
```

---

### Step 3: Implement getUserTransactions()

**File:** `src/actions/dashboard/index.ts` (Line 177)

Replace the placeholder with:

```typescript
export const getUserTransactions = async () => {
  try {
    const user = await currentUser()
    if (!user) return { data: [] }

    const connectedDodo = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { dodoMerchantId: true }
    })

    if (!connectedDodo?.dodoMerchantId) return { data: [] }

    // Fetch recent payments from Dodo API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DODO_API_URL}/payments?page_size=50`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('[Dodo API] Transactions fetch failed:', response.status)
      return { data: [] }
    }

    const data = await response.json()

    // Transform Dodo format to expected format
    const transactions = data.items?.map((payment: any) => ({
      id: payment.payment_id,
      amount: payment.total_amount, // in cents
      currency: payment.currency || 'usd',
      status: payment.status,
      customer_email: payment.customer?.email,
      customer_name: payment.customer?.name,
      created: payment.created_at,
      description: `Payment from ${payment.customer?.name || 'Customer'}`,
    })) || []

    return { data: transactions }

  } catch (error) {
    console.error('[getUserTransactions] Error:', error)
    return { data: [] }
  }
}
```

---

### Step 4: Add Balance Card to Dashboard (Optional)

**File:** `src/app/(dashboard)/dashboard/page.tsx` (Line 40)

If you want to show balance:

```typescript
const Page = async (props: Props) => {
  const conversations = await getUserConversations()
  const leads = await getUserClients()
  const appointments = await getUserAppointments()
  const balance = await getUserBalance() // ADD THIS
  const plan = await getUserPlanInfo()
  const transactions = await getUserTransactions()

  // ... conversion rate calculations ...

  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        <div className="flex gap-5 flex-wrap">
          <DashboardCard
            value={conversations || 0}
            title="Conversations"
            icon={<MessageSquare />}
          />
          <DashboardCard
            value={leads || 0}
            title="Leads Captured"
            icon={<PersonIcon />}
            percentage={leadsConversionRate}
          />
          <DashboardCard
            value={appointments || 0}
            title="Appointments"
            icon={<CalIcon />}
            percentage={appointmentsConversionRate}
          />
          {/* ADD THIS CARD */}
          <DashboardCard
            value={balance || 0}
            title="Total Earnings"
            icon={<DollarIcon />} // You may need to import/create this icon
            sales={true} // Shows $ prefix
          />
        </div>
        {/* ... rest of dashboard ... */}
      </div>
    </>
  )
}
```

---

### Step 5: Update Transaction Display UI (Optional)

**File:** `src/app/(dashboard)/dashboard/page.tsx` (Line 83-88)

Replace the placeholder message:

```typescript
<div className="flex flex-col">
  <div className="w-full flex justify-between items-start mb-5">
    <div className="flex gap-3 items-center">
      <TransactionsIcon />
      <p className="font-bold">Recent Transactions</p>
    </div>
    <p className="text-sm cursor-pointer hover:underline">See more</p>
  </div>
  <Separator orientation="horizontal" />

  {/* REPLACE THIS: */}
  {transactions?.data && transactions.data.length > 0 ? (
    <div className="space-y-3 py-4">
      {transactions.data.slice(0, 5).map((tx: any) => (
        <div key={tx.id} className="flex justify-between items-center py-2 border-b">
          <div>
            <p className="font-medium">${(tx.amount / 100).toFixed(2)}</p>
            <p className="text-sm text-gray-500">{tx.customer_email || 'Customer'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              {new Date(tx.created).toLocaleDateString()}
            </p>
            <p className={`text-xs ${tx.status === 'succeeded' ? 'text-green-600' : 'text-gray-500'}`}>
              {tx.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <p className="text-gray-500 mb-2">No transactions yet</p>
        <p className="text-sm text-gray-400">Payments will appear here once customers make purchases</p>
      </div>
    </div>
  )}
</div>
```

---

## 🧪 Testing

### 1. Test API Connection
```bash
# Test with cURL
curl https://test.dodopayments.com/payments \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"

# Should return:
# { "items": [ {payment_id, total_amount, status, ...}, ... ] }
```

### 2. Test Dashboard
```bash
npm run dev
# Visit: http://localhost:3000/dashboard
# Should see:
# - Balance: Real amount (or $0 if no payments)
# - Transactions: List or "No transactions yet"
```

### 3. Test Error Handling
```bash
# Remove DODO_API_KEY temporarily
# Dashboard should still load (showing $0 and empty list)
# No crashes ✓
```

---

## ⚡ Performance Optimization (Optional)

Add caching to reduce API calls:

```typescript
// Add at top of dashboard/index.ts
const balanceCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData(userId: string) {
  const cached = balanceCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(userId: string, data: any) {
  balanceCache.set(userId, { data, timestamp: Date.now() })
}

// Then in getUserBalance/getUserTransactions:
const cached = getCachedData(user.id)
if (cached) return cached

// ... fetch from API ...

setCachedData(user.id, result)
return result
```

---

## 📊 API Reference

### Dodo Payments GET /payments

**Endpoint:** `https://test.dodopayments.com/payments`

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: succeeded, failed, pending |
| `page_size` | integer | Results per page (max 100) |
| `page_number` | integer | Page to fetch (default 0) |
| `brand_id` | string | Filter by merchant ID |
| `customer_id` | string | Filter by customer |

**Response:**
```json
{
  "items": [
    {
      "payment_id": "pay_abc123",
      "total_amount": 4999,
      "currency": "usd",
      "status": "succeeded",
      "customer": {
        "customer_id": "cust_xyz",
        "email": "john@example.com",
        "name": "John Doe"
      },
      "created_at": "2025-01-30T10:00:00Z",
      "metadata": {}
    }
  ]
}
```

**Documentation:** https://docs.dodopayments.com/api-reference/payments/get-payments

---

## 🚨 Common Issues & Solutions

### Issue 1: "401 Unauthorized"
**Solution:** Check `DODO_API_KEY` in `.env` is correct

### Issue 2: "Empty transactions but payments exist"
**Solution:** Check `brand_id` filter or `dodoMerchantId` in database

### Issue 3: "Dashboard shows $0 but payments exist"
**Solution:** Check payment `status` (only "succeeded" are counted)

### Issue 4: "Slow dashboard load"
**Solution:** Implement caching (see Performance Optimization section)

---

## 📝 Rollback Plan

If something breaks:

1. **Quick Fix:** Revert functions to placeholder:
   ```typescript
   export const getUserBalance = async () => {
     return 0
   }
   export const getUserTransactions = async () => {
     return { data: [] }
   }
   ```

2. **Remove from UI:** Comment out balance card in dashboard page

3. **Restart server:** `npm run dev`

---

## ✅ Checklist Before Going Live

- [ ] Test API key works in both test and live environments
- [ ] Verify dodoMerchantId exists for test users
- [ ] Test with real payment data
- [ ] Check error handling (API down, network issues)
- [ ] Verify no breaking changes to existing features
- [ ] Test dashboard load time (should be < 2 seconds)
- [ ] Check mobile responsiveness
- [ ] Update `.env.example` with new variables

---

## 📞 Support Resources

- **Dodo Payments Docs:** https://docs.dodopayments.com
- **API Reference:** https://docs.dodopayments.com/api-reference/payments/get-payments
- **Support:** https://dodopayments.com/early-access (contact form)

---

**Ready to implement? Just follow these steps and you'll be done in 2-3 hours!** 🚀