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
          <div className="mb-5 max-w-2xl"><h2 className="text-lg font-semibold text-slate-950">Payment connection</h2><p className="mt-1 text-sm leading-6 text-slate-500">Let qualified visitors continue from a conversation to a secure client checkout.</p></div>
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
