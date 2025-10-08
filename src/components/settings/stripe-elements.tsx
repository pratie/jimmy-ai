'use client'

import React from 'react'
import { PaymentForm } from './payment-form'
import { PlanType } from '@/lib/plans'

type DodoPaymentProps = {
  payment: PlanType
}

export const DodoPayment = ({ payment }: DodoPaymentProps) => {
  return <PaymentForm plan={payment} />
}

// Keep the old export name for backward compatibility
export const StripeElements = DodoPayment
