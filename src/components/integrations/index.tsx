'use client'
import { INTEGRATION_LIST_ITEMS } from '@/constants/integrations'
import React from 'react'
import { CardDescription } from '../ui/card'
import { CreditCard } from 'lucide-react'
import IntegrationTrigger from './IntegrationTrigger'

type Props = {
  connections: {
    stripe: boolean
  }
}

const IntegrationsList = ({ connections }: Props) => {
  return (
    <div className="grid max-w-xl grid-cols-1 content-start gap-4">
      {INTEGRATION_LIST_ITEMS.map((item) => (
        <div key={item.id} className="group rounded-xl border border-border bg-card p-5 shadow-[0_6px_24px_rgba(15,23,42,.035)] transition hover:border-primary/40">
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-start justify-between gap-5">
              <div className="">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-muted text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-sm font-semibold text-foreground">{item.label}</h2>
              </div>
              <IntegrationTrigger
                connections={connections}
                title={item.title}
                descrioption={item.modalDescription}
                logo={item.logo}
                name={item.name}
              />
            </div>
            <CardDescription className="min-h-10 text-xs font-medium leading-5 text-muted-foreground">
              {item.description}
            </CardDescription>
          </div>
        </div>
      ))}
    </div>
  )
}

export default IntegrationsList
