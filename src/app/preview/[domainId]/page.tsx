import ChatbotPreview from '@/components/settings/chatbot-preview'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/lib/prisma'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ domainId: string }>
}) {
  const { domainId } = await params

  // Basic guard
  if (!domainId || typeof domainId !== 'string') {
    redirect('/dashboard')
  }

  // Fetch domain name to render a friendlier title
  const domain = await client.domain.findUnique({
    where: { id: domainId },
    select: { name: true },
  })
  const title = domain?.name ? `${domain.name} GPT` : 'Assistant GPT'

  return (
    <div className="min-h-screen w-full flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-[980px]">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Test conversations here before embedding on your website.
        </p>
        <ChatbotPreview domainId={domainId} />
      </div>
    </div>
  )
}
