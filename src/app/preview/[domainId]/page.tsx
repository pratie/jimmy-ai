import ChatbotPreview from '@/components/settings/chatbot-preview'
import { redirect } from 'next/navigation'

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

  return (
    <div className="min-h-screen w-full flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-[980px]">
        <h1 className="text-2xl font-bold mb-4">Chatbot Preview</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This is a full-page preview of your configured chatbot. Use it to test
          conversations before embedding on your website.
        </p>
        <ChatbotPreview domainId={domainId} />
      </div>
    </div>
  )
}
