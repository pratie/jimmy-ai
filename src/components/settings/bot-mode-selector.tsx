'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { useToast } from '@/components/ui/use-toast'
import { onUpdateBotMode } from '@/actions/settings'
import { useRouter } from 'next/navigation'

type BotMode = 'SALES' | 'SUPPORT' | 'QUALIFIER' | 'FAQ_STRICT'

interface BotModeSelectorProps {
  domainId: string
  currentMode: string | null
}

const MODE_OPTIONS: { value: BotMode; label: string; description: string }[] = [
  {
    value: 'SALES',
    label: 'Sales Agent',
    description: 'Drive conversions with qualification questions and clear CTAs for bookings/payments',
  },
  {
    value: 'SUPPORT',
    label: 'Support Agent',
    description: 'Troubleshoot issues using knowledge base and escalate when needed',
  },
  {
    value: 'QUALIFIER',
    label: 'Lead Qualifier',
    description: 'Quickly identify fit, collect information, and route to the right action',
  },
  {
    value: 'FAQ_STRICT',
    label: 'FAQ Only',
    description: 'Strict knowledge base answers only, no selling language',
  },
]

export const BotModeSelector = ({ domainId, currentMode }: BotModeSelectorProps) => {
  const [selectedMode, setSelectedMode] = useState<BotMode>((currentMode as BotMode) || 'SALES')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const onSave = async () => {
    setLoading(true)
    const result = await onUpdateBotMode(selectedMode, domainId)
    if (result?.status === 200) {
      toast({
        title: 'Success',
        description: result.message,
      })
      router.refresh()
    } else {
      toast({
        title: 'Error',
        description: result?.message || 'Failed to update mode',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Mode</CardTitle>
        <CardDescription>
          Choose how your chatbot should behave. Each mode is optimized for specific goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Loader loading={loading}>
          <div className="space-y-3">
            {MODE_OPTIONS.map((mode) => (
              <div
                key={mode.value}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    selectedMode === mode.value
                      ? 'border-brand-accent bg-brand-accent/10'
                      : 'border-brand-base-300 hover:border-brand-base-300'
                  }
                `}
                onClick={() => setSelectedMode(mode.value)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedMode === mode.value}
                    onChange={() => setSelectedMode(mode.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-semibold cursor-pointer">
                      {mode.label}
                    </Label>
                    <p className="text-xs text-brand-primary/60 mt-1">{mode.description}</p>
                  </div>
                </div>
              </div>
            ))}
            <Button
              onClick={onSave}
              disabled={loading || selectedMode === currentMode}
              className="w-full mt-4"
            >
              Save Mode
            </Button>
          </div>
        </Loader>
      </CardContent>
    </Card>
  )
}
