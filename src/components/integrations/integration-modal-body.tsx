import { CheckCircle2Icon } from 'lucide-react'
import React from 'react'
import { StripeConnect } from '../settings/stripe-connect'

type IntegrationModalBodyProps = {
  type: string
  connections: {
    [key in 'stripe']: boolean
  }
}

export const IntegrationModalBody = ({
  type,
  connections,
}: IntegrationModalBodyProps) => {
  switch (type) {
    case 'stripe':
      return (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground">Dodo Payments will be able to</h2>
          {[
            'Process payments from your client agents',
            'Create checkout sessions for qualified visitors',
            'Report payment activity back to your workspace',
          ].map((item, key) => (
            <div
              key={key}
              className="flex items-center gap-2 pl-3 text-sm text-muted-foreground"
            >
              <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-600" />
              <p>{item}</p>
            </div>
          ))}
          <div className="flex justify-end mt-8">
            <StripeConnect connected={connections[type]} />
          </div>
        </div>
      )
    default:
      return <></>
  }
}
