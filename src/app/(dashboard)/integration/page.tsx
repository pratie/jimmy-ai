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
          <div className="mb-6 max-w-2xl"><h2 className="text-2xl font-black tracking-tight text-slate-950">Connect the rest of the client stack.</h2><p className="mt-2 text-sm font-medium leading-6 text-slate-400">Turn a helpful conversation into a payment, booking, handoff, or CRM update.</p></div>
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
