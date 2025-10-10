'use client'
import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { useCompleteCustomerPayment } from '@/hooks/billing/use-billing'
import React from 'react'

type CustomerPaymentFormProps = {
  paymentLink: string
  loading: boolean
}

export const CustomerPaymentForm = ({ paymentLink, loading }: CustomerPaymentFormProps) => {
  const { onRedirectToPayment } = useCompleteCustomerPayment()

  return (
    <div className="flex flex-col">
      <div className="mb-5 p-4 bg-brand-accent/10 rounded-lg">
        <p className="text-sm text-brand-primary/70 mb-2">
          You will be redirected to Dodo Payments to complete your purchase securely.
        </p>
        <p className="text-xs text-brand-primary/60">
          After payment, you&apos;ll be redirected back to continue.
        </p>
      </div>
      <Button
        type="button"
        className="w-full mt-5"
        onClick={() => onRedirectToPayment(paymentLink)}
        disabled={!paymentLink || loading}
      >
        <Loader loading={loading}>
          {loading ? 'Creating payment link...' : 'Proceed to Payment'}
        </Loader>
      </Button>
    </div>
  )
}
