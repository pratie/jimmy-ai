'use client'

import React from 'react'
import { PaymentForm } from './payment-form'
import { PlanType } from '@/lib/plans'

type DodoPaymentProps = {
  payment: PlanType
  interval?: 'MONTHLY' | 'YEARLY'
}

export const DodoPayment = ({ payment, interval = 'MONTHLY' }: DodoPaymentProps) => {
  return <PaymentForm plan={payment} interval={interval} />
}

// Keep the old export name for backward compatibility
export const StripeElements = DodoPayment
