'use client'
import React from 'react'
import Section from '@/components/section-label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { onUpdateTheme } from '@/actions/settings'

type Theme = {
  primary: string
  surface: string
  text: string
  headerBg: string
  headerText: string
  userBubbleBg: string
  userBubbleText: string
  botBubbleBg: string
  botBubbleText: string
  inputBg: string
  inputBorder: string
  accent: string
  radius: number
  shadow: 'none' | 'sm'
}

const DEFAULT_THEME: Theme = {
  primary: '#2563EB',
  surface: '#FFFFFF',
  text: '#111827',
  headerBg: '#FFFFFF',
  headerText: '#111827',
  userBubbleBg: '#2563EB',
  userBubbleText: '#FFFFFF',
  botBubbleBg: '#F3F4F6',
  botBubbleText: '#111827',
  inputBg: '#FFFFFF',
  inputBorder: '#D1D5DB',
  accent: '#2563EB',
  radius: 10,
  shadow: 'sm',
}

type Props = {
  domainId: string
  current?: Partial<Theme> | null
}

export const AppearanceSettings = ({ domainId, current }: Props) => {
  const { toast } = useToast()
  const [saving, setSaving] = React.useState(false)
  const [theme, setTheme] = React.useState<Theme>({ ...DEFAULT_THEME, ...(current || {}) })

  const onChange = (key: keyof Theme, value: string | number) => {
    setTheme((t) => ({ ...t, [key]: value as any }))
  }

  const onSave = async () => {
    setSaving(true)
    const res = await onUpdateTheme(domainId, theme as any)
    setSaving(false)
    if (res?.status === 200) {
      toast({ title: 'Success', description: 'Appearance updated' })
    } else {
      toast({ title: 'Error', description: res?.message || 'Failed to update appearance' })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Section label="Appearance" message="Customize chat colors and surfaces" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-xs flex items-center justify-between">Primary
          <input type="color" className="h-8 w-12" value={theme.primary} onChange={(e)=>onChange('primary', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">Surface
          <input type="color" className="h-8 w-12" value={theme.surface} onChange={(e)=>onChange('surface', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">Text
          <input type="color" className="h-8 w-12" value={theme.text} onChange={(e)=>onChange('text', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">Header bg
          <input type="color" className="h-8 w-12" value={theme.headerBg} onChange={(e)=>onChange('headerBg', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">Header text
          <input type="color" className="h-8 w-12" value={theme.headerText} onChange={(e)=>onChange('headerText', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">User bubble
          <input type="color" className="h-8 w-12" value={theme.userBubbleBg} onChange={(e)=>onChange('userBubbleBg', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">User text
          <input type="color" className="h-8 w-12" value={theme.userBubbleText} onChange={(e)=>onChange('userBubbleText', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">Bot bubble
          <input type="color" className="h-8 w-12" value={theme.botBubbleBg} onChange={(e)=>onChange('botBubbleBg', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">Bot text
          <input type="color" className="h-8 w-12" value={theme.botBubbleText} onChange={(e)=>onChange('botBubbleText', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">Input bg
          <input type="color" className="h-8 w-12" value={theme.inputBg} onChange={(e)=>onChange('inputBg', e.target.value)} />
        </label>
        <label className="text-xs flex items-center justify-between">Input border
          <input type="color" className="h-8 w-12" value={theme.inputBorder} onChange={(e)=>onChange('inputBorder', e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="flex items-center">
          <label className="text-xs">Radius</label>
          <input type="range" min={6} max={14} step={1} className="ml-3 w-56" value={theme.radius} onChange={(e)=>onChange('radius', parseInt(e.target.value))} />
          <span className="ml-2 text-xs text-muted-foreground">{theme.radius}px</span>
        </div>

        <div className="flex items-center md:justify-end">
          <label className="text-xs">Shadow</label>
          <select className="ml-3 border rounded px-2 py-1 text-xs" value={theme.shadow} onChange={(e)=>onChange('shadow', e.target.value)}>
            <option value="none">None</option>
            <option value="sm">Small</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" onClick={onSave} disabled={saving} className="min-w-[180px]">
          {saving ? 'Saving…' : 'Save appearance'}
        </Button>
      </div>
    </div>
  )
}

export default AppearanceSettings
