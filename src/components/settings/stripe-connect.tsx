'use client'
import React from 'react'
import { Button } from '../ui/button'
import { Loader } from '../loader'
import { useDodoPayments } from '@/hooks/billing/use-billing'

type DodoConnectProps = {
  connected: boolean
}

export const DodoConnect = ({ connected }: DodoConnectProps) => {
  const { onDodoConnect, onDodoAccountPending } = useDodoPayments()
  return (
    <Button
      disabled={connected}
      onClick={onDodoConnect}
    >
      <Loader loading={onDodoAccountPending}>
        {connected ? 'Connected to Dodo Payments' : 'Connect to Dodo Payments'}
      </Loader>
    </Button>
  )
}

// Keep the old export for backward compatibility, but deprecated
export const StripeConnect = DodoConnect
