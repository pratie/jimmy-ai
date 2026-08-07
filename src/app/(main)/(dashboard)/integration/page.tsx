import type { Metadata } from 'next'
import { onGetPaymentConnected } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import IntegrationsList from '@/components/integrations'

const IntegrationsPage = async () => {
  const payment = await onGetPaymentConnected()

  const connections = {
    stripe: payment ? true : false,
  }

  return (
    <>
      <InfoBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8">
          <div className="mb-5 max-w-2xl">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Payment connection
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Let qualified visitors continue from a conversation to a secure client checkout.
            </p>
          </div>
          <IntegrationsList connections={connections} />
        </div>
      </div>
    </>
  )
}

export default IntegrationsPage

export const metadata: Metadata = {
  title: 'Integrations — ChatDock',
  robots: { index: false, follow: false },
}
