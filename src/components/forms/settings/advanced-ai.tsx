'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { useToast } from '@/components/ui/use-toast'
import { onUpdateLlmConfig, onUpdateModePrompts } from '@/actions/settings'
import { DEFAULT_MODE_BLOCKS } from '@/lib/promptBuilder'
import { useRouter } from 'next/navigation'

type Props = {
  domainId: string
  domainName: string
  currentModel: string
  currentTemperature: number
  modePrompts: Record<string, string> | null
}

const MODEL_OPTIONS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4.1-mini',
  'gpt-4.1',
]

const AdvancedAISettings = ({
  domainId,
  domainName,
  currentModel,
  currentTemperature,
  modePrompts,
}: Props) => {
  const router = useRouter()
  const { toast } = useToast()
  const [savingModel, setSavingModel] = useState(false)
  const [savingPrompts, setSavingPrompts] = useState(false)

  // LLM Config state
  const [model, setModel] = useState(currentModel || 'gpt-4o-mini')
  const [temperature, setTemperature] = useState<number>(
    typeof currentTemperature === 'number' ? currentTemperature : 0.7
  )

  // Mode prompts state (seed with overrides or defaults)
  const defaultBlocks = useMemo(() => DEFAULT_MODE_BLOCKS, [])
  const [sales, setSales] = useState<string>(modePrompts?.SALES || defaultBlocks.SALES)
  const [support, setSupport] = useState<string>(modePrompts?.SUPPORT || defaultBlocks.SUPPORT)
  const [qualifier, setQualifier] = useState<string>(modePrompts?.QUALIFIER || defaultBlocks.QUALIFIER)
  const [faq, setFaq] = useState<string>(modePrompts?.FAQ_STRICT || defaultBlocks.FAQ_STRICT)

  const onSaveModel = async () => {
    setSavingModel(true)
    const res = await onUpdateLlmConfig(model, temperature, domainId)
    toast({ title: res?.status === 200 ? 'Success' : 'Error', description: res?.message })
    setSavingModel(false)
    router.refresh()
  }

  const onSavePrompts = async () => {
    setSavingPrompts(true)
    const payload = {
      SALES: sales,
      SUPPORT: support,
      QUALIFIER: qualifier,
      FAQ_STRICT: faq,
    }
    const res = await onUpdateModePrompts(payload, domainId)
    toast({ title: res?.status === 200 ? 'Success' : 'Error', description: res?.message })
    setSavingPrompts(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Advanced AI Settings</h1>
        <a href={`/settings/${domainName}`} className="text-sm underline">Back to Settings</a>
      </div>

      {/* LLM Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Model & Temperature</CardTitle>
          <CardDescription>Choose an OpenAI model and set response creativity</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader loading={savingModel}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="llm-model">Model</Label>
                <select
                  id="llm-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-md border-brand-base-300 bg-white/95 text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <p className="text-xs text-brand-primary/60">Default: gpt-4o-mini</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <input
                  id="temperature"
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-xs text-brand-primary/60">0 = precise, 1 = creative</span>
                </div>
              </div>
            </div>
            <Button className="mt-4" onClick={onSaveModel} disabled={savingModel}>Save Model</Button>
          </Loader>
        </CardContent>
      </Card>

      {/* Per-mode prompt overrides */}
      <Card>
        <CardHeader>
          <CardTitle>Mode Prompts</CardTitle>
          <CardDescription>Customize the instruction block for each bot mode</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader loading={savingPrompts}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Sales Agent</Label>
                <Textarea value={sales} onChange={(e) => setSales(e.target.value)} rows={8} />
              </div>
              <div className="space-y-2">
                <Label>Support Agent</Label>
                <Textarea value={support} onChange={(e) => setSupport(e.target.value)} rows={8} />
              </div>
              <div className="space-y-2">
                <Label>Lead Qualifier</Label>
                <Textarea value={qualifier} onChange={(e) => setQualifier(e.target.value)} rows={8} />
              </div>
              <div className="space-y-2">
                <Label>FAQ Only</Label>
                <Textarea value={faq} onChange={(e) => setFaq(e.target.value)} rows={8} />
              </div>
              <Button onClick={onSavePrompts} disabled={savingPrompts} className="w-full">Save Mode Prompts</Button>
            </div>
          </Loader>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedAISettings

