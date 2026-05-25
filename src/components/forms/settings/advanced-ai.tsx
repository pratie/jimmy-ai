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
import { AVAILABLE_MODELS } from '@/lib/ai-models'
import { OpenAIIcon, AnthropicIcon, GoogleIcon } from '@/components/icons/provider-icons'

type Props = {
  domainId: string
  domainName: string
  currentModel: string
  currentTemperature: number
  modePrompts: Record<string, string> | null
}

// Filter models to OpenAI, Anthropic, and Google
const OPENAI_MODELS = AVAILABLE_MODELS.filter(m => m.provider === 'OpenAI')
const ANTHROPIC_MODELS = AVAILABLE_MODELS.filter(m => m.provider === 'Anthropic')
const GOOGLE_MODELS = AVAILABLE_MODELS.filter(m => m.provider === 'Google')

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
  const [model, setModel] = useState(currentModel || 'gemini-2.5-flash-lite')
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
    <div className="flex flex-col gap-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Advanced AI Settings</h1>
        <a href={`/settings/${domainName}`} className="text-sm text-white/60 hover:text-white underline transition-colors">Back to Settings</a>
      </div>

      {/* Model Provider Config */}
      <Card className="bg-card border-white/[0.04] shadow-[0_20px_45px_rgba(0,0,0,0.5)]">
        <CardHeader className="border-b border-white/[0.04] pb-4">
          <CardTitle className="text-white">Model & Temperature</CardTitle>
          <CardDescription className="text-white/60">Choose your AI model provider and set response creativity</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Loader loading={savingModel}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="llm-model" className="text-white/80 font-medium">Model</Label>
                <div className="relative">
                  <select
                    id="llm-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2.5 pl-10 border border-white/[0.08] rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40 appearance-none"
                  >
                    <optgroup label="OpenAI" className="bg-[#09090b]">
                      {OPENAI_MODELS.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#09090b] text-white">
                          {m.name} ({m.contextWindow.toLocaleString()} tokens)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Anthropic Claude" className="bg-[#09090b]">
                      {ANTHROPIC_MODELS.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#09090b] text-white">
                          {m.name} ({m.contextWindow.toLocaleString()} tokens)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Google Gemini" className="bg-[#09090b]">
                      {GOOGLE_MODELS.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#09090b] text-white">
                          {m.name} ({m.contextWindow.toLocaleString()} tokens)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {model.startsWith('gpt-') && <OpenAIIcon size={18} className="text-white" />}
                    {model.startsWith('claude-') && <AnthropicIcon size={18} className="text-white" />}
                    {model.startsWith('gemini-') && <GoogleIcon size={18} className="text-white" />}
                  </div>
                </div>
                <p className="text-xs text-white/40">
                  Multi-provider support: OpenAI, Anthropic Claude & Google Gemini
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-white/80 font-medium">Temperature</Label>
                <div className="py-2">
                  <input
                    id="temperature"
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-[#0071E3] bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-24 bg-white/5 border-white/[0.08] text-white rounded-xl"
                  />
                  <span className="text-xs text-white/40">0 = precise, 1 = creative</span>
                </div>
              </div>
            </div>
            <Button className="mt-6 bg-[#0071E3] hover:bg-[#0071E3]/90 text-white font-semibold rounded-xl shadow-[0_4px_12px_rgba(0,113,227,0.3)]" onClick={onSaveModel} disabled={savingModel}>Save Model</Button>
          </Loader>
        </CardContent>
      </Card>

      {/* Per-mode prompt overrides */}
      <Card className="bg-card border-white/[0.04] shadow-[0_20px_45px_rgba(0,0,0,0.5)]">
        <CardHeader className="border-b border-white/[0.04] pb-4">
          <CardTitle className="text-white">Mode Prompts</CardTitle>
          <CardDescription className="text-white/60">Customize the instruction block for each bot mode</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Loader loading={savingPrompts}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Sales Agent</Label>
                <Textarea value={sales} onChange={(e) => setSales(e.target.value)} rows={8} className="bg-white/5 border-white/[0.08] text-white rounded-xl placeholder:text-white/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Support Agent</Label>
                <Textarea value={support} onChange={(e) => setSupport(e.target.value)} rows={8} className="bg-white/5 border-white/[0.08] text-white rounded-xl placeholder:text-white/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Lead Qualifier</Label>
                <Textarea value={qualifier} onChange={(e) => setQualifier(e.target.value)} rows={8} className="bg-white/5 border-white/[0.08] text-white rounded-xl placeholder:text-white/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">FAQ Only</Label>
                <Textarea value={faq} onChange={(e) => setFaq(e.target.value)} rows={8} className="bg-white/5 border-white/[0.08] text-white rounded-xl placeholder:text-white/30" />
              </div>
              <Button onClick={onSavePrompts} disabled={savingPrompts} className="w-full bg-[#0071E3] hover:bg-[#0071E3]/90 text-white font-semibold rounded-xl shadow-[0_4px_12px_rgba(0,113,227,0.3)]">Save Mode Prompts</Button>
            </div>
          </Loader>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedAISettings

