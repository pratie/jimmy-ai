'use client'
import { INTEGRATION_LIST_ITEMS } from '@/constants/integrations'
import React from 'react'
import { CardDescription } from '../ui/card'
import Image from 'next/image'
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
        <div key={item.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,.035)] transition hover:border-slate-300">
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-start justify-between gap-5">
              <div className="">
                <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2">
                  <Image
                    sizes="100vw"
                    src={`https://ucarecdn.com/${item.logo}/`}
                    alt="Logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <h2 className="mt-4 text-sm font-semibold capitalize text-slate-900">{item.name}</h2>
              </div>
              <IntegrationTrigger
                connections={connections}
                title={item.title}
                descrioption={item.modalDescription}
                logo={item.logo}
                name={item.name}
              />
            </div>
            <CardDescription className="min-h-10 text-xs font-medium leading-5 text-slate-400">{item.description}</CardDescription>
          </div>
        </div>
      ))}
    </div>
  )
}

export default IntegrationsList
