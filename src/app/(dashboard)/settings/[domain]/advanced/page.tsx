import { onGetCurrentDomainInfo } from '@/actions/settings'
import AdvancedAISettings from '@/components/forms/settings/advanced-ai'
import { redirect } from 'next/navigation'

const AdvancedAIPage = async (
  { params }: { params: Promise<{ domain: string }> }
) => {
  const { domain: domainParam } = await params
  const domain = await onGetCurrentDomainInfo(domainParam)
  if (!domain || !domain.domains.length) {
    redirect('/dashboard')
  }

  const active = domain.domains[0]

  return (
    <div className="w-full flex-1 h-0 overflow-x-hidden">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <AdvancedAISettings
          domainId={active.id}
          domainName={active.name}
          currentModel={active.chatBot?.llmModel || 'gemini-2.5-flash-lite'}
          currentTemperature={typeof active.chatBot?.llmTemperature === 'number' ? (active.chatBot?.llmTemperature as number) : 0.7}
          modePrompts={(active.chatBot?.modePrompts as any) || null}
        />
      </div>
    </div>
  )
}

export default AdvancedAIPage

