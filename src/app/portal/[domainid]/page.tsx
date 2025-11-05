import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Portal — ChatDock',
  description: 'This portal URL is used for appointment and checkout links shared in chat conversations.',
  robots: { index: false, follow: false },
}

export default async function PortalIndex({ params }: { params: Promise<{ domainid: string }> }) {
  const { domainid } = await params
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-2xl font-bold">Portal</h1>
        <p className="text-muted-foreground">
          This portal base URL is used by your assistant to share appointment and payment links.
          If you were expecting a specific action, please check your message for the full link.
        </p>
        <div className="text-sm text-muted-foreground">
          <code className="px-2 py-1 rounded bg-muted">{`/portal/${domainid}`}</code>
        </div>
        <div className="pt-2">
          <Link href="/" className="underline underline-offset-4">Go back to homepage</Link>
        </div>
      </div>
    </main>
  )
}
