'use server'

import { client } from '@/lib/prisma'

/**
 * Service catalogue and connected-merchant lookup for a client's payment page.
 *
 * Public path — reached from the customer-facing portal, so it deliberately
 * takes only a workspace id and returns nothing but what a checkout page needs.
 *
 * Amounts are minor units with an explicit currency. The old version summed a
 * bare `price` integer whose unit was never stated anywhere, which is the kind
 * of ambiguity that eventually charges someone 100× too much.
 */
export const onGetDomainProductsAndConnectedAccountId = async (clientWorkspaceId: string) => {
  try {
    const workspace = await client.clientWorkspace.findUnique({
      where: { id: clientWorkspaceId },
      select: {
        id: true,
        deletedAt: true,
        organization: {
          select: {
            integrations: {
              where: { provider: 'dodo', status: 'connected' },
              select: { configuration: true },
              take: 1,
            },
          },
        },
        serviceItems: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            priceAmountMinor: true,
            currency: true,
            pricingType: true,
          },
        },
      },
    })

    if (!workspace || workspace.deletedAt) return undefined

    const merchantId = (workspace.organization?.integrations?.[0]?.configuration as
      | { merchantId?: string }
      | null)?.merchantId

    // Only fixed-price items are summable. "From $450" and "quote required" are
    // not amounts, and folding them into a total would misrepresent the price.
    const fixed = workspace.serviceItems.filter(
      (item) => item.pricingType === 'fixed' && item.priceAmountMinor !== null
    )
    const amountMinor = fixed.reduce((total, item) => total + (item.priceAmountMinor ?? 0), 0)

    return {
      products: workspace.serviceItems.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.imageUrl,
        priceAmountMinor: item.priceAmountMinor,
        currency: item.currency,
        pricingType: item.pricingType,
        // Legacy field the portal still reads; major units, fixed prices only.
        price: item.pricingType === 'fixed' ? (item.priceAmountMinor ?? 0) / 100 : 0,
      })),
      amountMinor,
      amount: amountMinor / 100,
      currency: fixed.find((i) => i.currency)?.currency ?? 'USD',
      dodoMerchantId: merchantId ?? null,
    }
  } catch (error) {
    console.error('[Payments] onGetDomainProductsAndConnectedAccountId failed:', error)
    return undefined
  }
}
