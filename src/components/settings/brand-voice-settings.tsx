'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { useToast } from '@/components/ui/use-toast'
import { onUpdateBrandVoice } from '@/actions/settings'
import { useRouter } from 'next/navigation'

interface BrandVoiceSettingsProps {
  domainId: string
  currentBrandTone: string | null
  currentLanguage: string | null
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'hi', label: 'Hindi' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
]

const TONE_PRESETS = [
  'friendly, concise',
  'professional, helpful',
  'casual, conversational',
  'formal, technical',
  'warm, empathetic',
  'enthusiastic, high-energy',
]

export const BrandVoiceSettings = ({
  domainId,
  currentBrandTone,
  currentLanguage,
}: BrandVoiceSettingsProps) => {
  const [brandTone, setBrandTone] = useState(currentBrandTone || 'friendly, concise')
  const [language, setLanguage] = useState(currentLanguage || 'en')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const onSave = async () => {
    setLoading(true)
    const result = await onUpdateBrandVoice(brandTone, language, domainId)
    if (result?.status === 200) {
      toast({
        title: 'Success',
        description: result.message,
      })
      router.refresh()
    } else {
      toast({
        title: 'Error',
        description: result?.message || 'Failed to update brand voice',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Voice & Language</CardTitle>
        <CardDescription>
          Customize how your bot speaks to match your brand personality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Loader loading={loading}>
          <div className="space-y-4">
            {/* Language Selector */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Tone Input */}
            <div className="space-y-2">
              <Label htmlFor="brandTone">Brand Tone</Label>
              <Input
                id="brandTone"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                placeholder="e.g., friendly, concise"
              />
              <p className="text-xs text-gray-500">
                Describe your brand voice in 2-3 words (e.g., professional, helpful)
              </p>
            </div>

            {/* Tone Presets */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {TONE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBrandTone(preset)}
                    className={`
                      px-3 py-1 text-xs rounded-full border transition-all
                      ${
                        brandTone === preset
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={onSave}
              disabled={
                loading ||
                (brandTone === currentBrandTone && language === currentLanguage)
              }
              className="w-full"
            >
              Save Settings
            </Button>
          </div>
        </Loader>
      </CardContent>
    </Card>
  )
}