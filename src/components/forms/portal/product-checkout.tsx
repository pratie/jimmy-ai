'use client'
import React from 'react'
import { useDodoCustomer } from '@/hooks/billing/use-billing'
import { Loader } from '@/components/loader'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { CustomerPaymentForm } from './payment-form'
import { ArrowLeft, LockKeyhole } from 'lucide-react'

type Props = {
  onBack(): void
  products?:
    | {
        id?: string
        name: string
        image: string
        price: number
      }[]
    | undefined
  amount?: number
  onNext(): void
  customerEmail: string
  domainId: string
  customerId: string
}

const PaymentCheckout = ({
  onBack,
  onNext,
  amount,
  products,
  customerEmail,
  domainId,
  customerId,
}: Props) => {
  // Transform products for Dodo API
  const dodoProducts = products?.map(product => ({
    id: product.id || `product_${Date.now()}`, // Generate ID if not provided
    name: product.name,
    price: product.price,
  })) || []

  const { paymentLink, loadForm } = useDodoCustomer(
    dodoProducts,
    customerEmail,
    domainId,
    customerId
  )

  return (
    <Loader loading={loadForm}>
      <div>
        <div className="flex items-start justify-between"><div><h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Secure checkout</h2><p className="mt-2 text-sm text-slate-500">Review your order and complete payment.</p></div><div className="flex items-center gap-1.5 text-[11px] text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> Encrypted</div></div>
        <div className="mt-7 grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-medium text-slate-500">Order total</p><h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">${Number(amount || 0).toFixed(2)}</h2>
            <div className="mt-5 space-y-3">
            {products &&
              products.map((product, key) => (
                <Card
                  key={key}
                  className="flex w-full gap-3 rounded-xl border-slate-200 p-3 shadow-none"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={`https://ucarecdn.com/${product.image}/`}
                      alt="product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">{product.name}</p>
                    <p className="text-sm font-semibold text-slate-900">${product.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <CustomerPaymentForm
              paymentLink={paymentLink}
              loading={loadForm}
            />
          </div>
        </div>
        <button type="button" onClick={onBack} className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"><ArrowLeft className="h-3.5 w-3.5" /> Back to details</button>
      </div>
    </Loader>
  )
}

export default PaymentCheckout
