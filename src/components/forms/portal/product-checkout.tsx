'use client'
import React from 'react'
import { useDodoCustomer } from '@/hooks/billing/use-billing'
import { Loader } from '@/components/loader'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { CustomerPaymentForm } from './payment-form'

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
      <div className="flex flex-col gap-5 justify-center">
        <div className="flex justify-center">
          <h2 className="text-4xl font-bold mb-5">Payment</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="col-span-1 border-r-2 pr-5 flex flex-col">
            <h2 className="text-3xl font-bold mb-5">${amount}</h2>
            {products &&
              products.map((product, key) => (
                <Card
                  key={key}
                  className="w-full flex gap-2 p-3"
                >
                  <div className="w-2/12 aspect-square relative">
                    <Image
                      src={`https://ucarecdn.com/${product.image}/`}
                      alt="product"
                      fill
                    />
                  </div>
                  <div className="flex-1 flex justify-between">
                    <p className="text-xl font-semibold">{product.name}</p>
                    <p className="text-2xl font-bold">${product.price}</p>
                  </div>
                </Card>
              ))}
          </div>
          <div className="col-span-1 pl-5">
            <CustomerPaymentForm
              paymentLink={paymentLink}
              loading={loadForm}
            />
          </div>
        </div>
      </div>
    </Loader>
  )
}

export default PaymentCheckout
