'use client'
import React, { useMemo, useState } from 'react'
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
  const [activePrompt, setActivePrompt] = useState<'sales' | 'support' | 'qualifier' | 'faq'>('sales')

  const promptOptions = [
    { key: 'sales' as const, label: 'Sales', value: sales, update: setSales },
    { key: 'support' as const, label: 'Support', value: support, update: setSupport },
    { key: 'qualifier' as const, label: 'Qualifier', value: qualifier, update: setQualifier },
    { key: 'faq' as const, label: 'FAQ only', value: faq, update: setFaq },
  ]
  const selectedPrompt = promptOptions.find((option) => option.key === activePrompt)!

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
    <div className="flex flex-col gap-5 text-slate-950">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Advanced AI</h1><p className="mt-1 text-sm text-slate-500">Model selection and mode-specific instruction overrides.</p></div>
        <a href={`/settings/${domainName}`} className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700">Back to agent</a>
      </div>

      {/* Model Provider Config */}
      <Card className="rounded-2xl border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,.035)]">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">Model and response range</CardTitle>
          <CardDescription className="text-sm text-slate-500">Choose the model and balance consistency with variation.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Loader loading={savingModel}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="llm-model" className="text-xs font-semibold text-slate-700">Model</Label>
                <div className="relative">
                  <select
                    id="llm-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <optgroup label="OpenAI">
                      {OPENAI_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.contextWindow.toLocaleString()} tokens)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Anthropic Claude">
                      {ANTHROPIC_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.contextWindow.toLocaleString()} tokens)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Google Gemini">
                      {GOOGLE_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.contextWindow.toLocaleString()} tokens)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {model.startsWith('gpt-') && <OpenAIIcon size={18} className="text-slate-700" />}
                    {model.startsWith('claude-') && <AnthropicIcon size={18} className="text-slate-700" />}
                    {model.startsWith('gemini-') && <GoogleIcon size={18} className="text-slate-700" />}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Available providers depend on your workspace configuration.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-xs font-semibold text-slate-700">Response variation</Label>
                <div className="py-2">
                  <input
                    id="temperature"
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
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
                    className="w-24 rounded-xl border-slate-300 bg-white text-slate-800"
                  />
                  <span className="text-xs text-slate-400">0 is precise · 1 allows more variation</span>
                </div>
              </div>
            </div>
            <Button className="mt-6 rounded-xl bg-[#111827] text-sm font-semibold text-white hover:bg-[#252d3d]" onClick={onSaveModel} disabled={savingModel}>Save model settings</Button>
          </Loader>
        </CardContent>
      </Card>

      {/* Per-mode prompt overrides */}
      <Card className="rounded-2xl border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,.035)]">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">Mode instructions</CardTitle>
          <CardDescription className="text-sm text-slate-500">Override the instruction block used for each agent mode.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Loader loading={savingPrompts}>
            <div>
              <div className="mb-4 flex flex-wrap gap-2">{promptOptions.map((option) => <button key={option.key} type="button" onClick={() => setActivePrompt(option.key)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${activePrompt === option.key ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>{option.label}</button>)}</div>
              <Label className="text-xs font-semibold text-slate-700">{selectedPrompt.label} instructions</Label>
              <Textarea value={selectedPrompt.value} onChange={(event) => selectedPrompt.update(event.target.value)} rows={12} className="mt-2 rounded-xl border-slate-300 bg-white font-mono text-xs leading-6 text-slate-700 focus:border-indigo-400 focus:ring-indigo-100" />
              <div className="mt-4 flex items-center justify-between gap-4"><p className="text-xs text-slate-400">Changes affect future conversations using this mode.</p><Button onClick={onSavePrompts} disabled={savingPrompts} className="shrink-0 rounded-xl bg-[#111827] text-sm font-semibold text-white hover:bg-[#252d3d]">Save instructions</Button></div>
            </div>
          </Loader>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedAISettings
