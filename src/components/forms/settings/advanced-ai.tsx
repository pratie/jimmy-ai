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
import { ArrowLeft } from 'lucide-react'

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
    const res = await onUpdateLlmConfig(model, String(temperature), Number(domainId))
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
    const res = await onUpdateModePrompts(domainId, payload as never)
    toast({ title: res?.status === 200 ? 'Success' : 'Error', description: res?.message })
    setSavingPrompts(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 text-foreground">
      {/* Same header shape as the workspace: title, one line of context, and a
          single action on the right. */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">Advanced</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Model, response variation and the instruction block behind each mode.
          </p>
        </div>
        <a
          href={`/settings/${domainName}`}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12.5px] font-semibold text-foreground transition-colors duration-150 hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the assistant
        </a>
      </div>

      {/* Model Provider Config */}
      <Card className="rounded-xl border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Model and response range</CardTitle>
          <CardDescription className="text-[12.5px] leading-5 text-muted-foreground">Choose the model and balance consistency with variation.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Loader loading={savingModel}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="llm-model" className="text-xs font-semibold text-foreground">Model</Label>
                <div className="relative">
                  <select
                    id="llm-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-ring focus:ring-4 focus:ring-ring/20"
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
                    {model.startsWith('gpt-') && <OpenAIIcon size={18} className="text-foreground" />}
                    {model.startsWith('claude-') && <AnthropicIcon size={18} className="text-foreground" />}
                    {model.startsWith('gemini-') && <GoogleIcon size={18} className="text-foreground" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  Available providers depend on your workspace configuration.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-xs font-semibold text-foreground">Response variation</Label>
                <div className="py-2">
                  <input
                    id="temperature"
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
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
                    className="w-24 rounded-xl border-border bg-card text-foreground"
                  />
                  <span className="text-xs text-muted-foreground/70">0 is precise · 1 allows more variation</span>
                </div>
              </div>
            </div>
            <Button className="mt-6 h-9 rounded-lg bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90" onClick={onSaveModel} disabled={savingModel}>Save model settings</Button>
          </Loader>
        </CardContent>
      </Card>

      {/* Per-mode prompt overrides */}
      <Card className="rounded-xl border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Mode instructions</CardTitle>
          <CardDescription className="text-[12.5px] leading-5 text-muted-foreground">Override the instruction block used for each agent mode.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Loader loading={savingPrompts}>
            <div>
              {/* Same segmented shape the workspace uses for mode, so the two
                  screens read as one product. */}
              <div className="mb-4 flex w-full max-w-md gap-1 rounded-xl border border-border bg-muted/50 p-1">
                {promptOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setActivePrompt(option.key)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-[12.5px] font-semibold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${activePrompt === option.key ? 'bg-card text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08)]' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Label className="text-xs font-semibold text-foreground">{selectedPrompt.label} instructions</Label>
              <Textarea value={selectedPrompt.value} onChange={(event) => selectedPrompt.update(event.target.value)} rows={12} className="mt-2 rounded-lg border-border bg-card font-mono text-xs leading-6 text-foreground focus:border-ring focus:ring-ring/20" />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-[11.5px] text-muted-foreground/70">Changes affect future conversations using this mode.</p><Button onClick={onSavePrompts} disabled={savingPrompts} className="h-9 shrink-0 rounded-lg bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90">Save instructions</Button></div>
            </div>
          </Loader>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedAISettings
