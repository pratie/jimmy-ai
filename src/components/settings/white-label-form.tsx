'use client'
import React, { useState, useEffect } from 'react'
import Section from '../section-label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Loader } from '../loader'
import { useToast } from '../ui/use-toast'
import { onGetWhiteLabelSettings, onUpdateWhiteLabelSettings } from '@/actions/settings'

const WhiteLabelBranding = () => {
  // The dashboard mounts exactly one toaster — the shadcn one, in the main
  // layout. This form used to call sonner, whose provider is never rendered, so
  // saving branding reported nothing at all.
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [agencyName, setAgencyName] = useState('ChatDock')
  const [agencyLogo, setAgencyLogo] = useState('')
  const [agencyColor, setAgencyColor] = useState('#0f172a')
  const [hideBranding, setHideBranding] = useState(false)

  // Fetch current white label settings on load
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await onGetWhiteLabelSettings()
        if (res?.status === 200 && res.settings) {
          setAgencyName(res.settings.agencyName || 'ChatDock')
          setAgencyLogo(res.settings.agencyLogo || '')
          setAgencyColor(res.settings.agencyColor || '#0f172a')
          setHideBranding(res.settings.hideBranding || false)
        }
      } catch (err) {
        console.error('Error fetching white label settings:', err)
      } finally {
        setFetching(false)
      }
    };
    fetchBranding()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await onUpdateWhiteLabelSettings({
        agencyName,
        agencyLogo: agencyLogo || null as any,
        agencyColor,
        hideBranding,
      })

      if (res?.status === 200) {
        toast({ title: 'Branding saved', description: res.message || 'Your agency branding is now in use.' })
      } else {
        toast({
          variant: 'destructive',
          title: 'Not saved',
          description: res?.message || 'Could not update the branding settings.',
        })
      }
    } catch (err) {
      console.error('Error saving white label settings:', err)
      toast({
        variant: 'destructive',
        title: 'Not saved',
        description: 'Something went wrong. Try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader loading={true}><div /></Loader>
      </div>
    )
  }

  return (
    <section className="grid gap-7 rounded-xl border border-border bg-card p-6 shadow-[0_6px_24px_rgba(15,23,42,.035)] lg:grid-cols-[220px_minmax(0,1fr)] md:p-7">
      <div>
        <Section
          label="Agency Branding"
          message="White-label the transactional portals and widgets under your own name and style guidelines."
        />
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="flex flex-col gap-5">
          {/* Agency Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="agency-name" className="text-sm font-semibold text-foreground/80">
              Agency/Company Name
            </Label>
            <Input
              id="agency-name"
              type="text"
              placeholder="e.g. Acme AI Solutions"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="rounded-xl bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground">
              Replaces all default platform text (e.g. inside chatbot attribution footers).
            </p>
          </div>

          {/* Agency Logo */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="agency-logo" className="text-sm font-semibold text-foreground/80">
              Agency Logo URL
            </Label>
            <Input
              id="agency-logo"
              type="text"
              placeholder="https://yourdomain.com/logo.svg"
              value={agencyLogo}
              onChange={(e) => setAgencyLogo(e.target.value)}
              className="rounded-xl bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground">
              Logo displayed at the top of client booking and payment portals.
            </p>
          </div>

          {/* Accent Theme Color */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="agency-color" className="text-sm font-semibold text-foreground/80">
              Portal Accent Color
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="agency-color-picker"
                type="color"
                value={agencyColor}
                onChange={(e) => setAgencyColor(e.target.value)}
                className="w-12 h-10 p-1 border border-input rounded-lg bg-background cursor-pointer shrink-0"
              />
              <Input
                id="agency-color"
                type="text"
                value={agencyColor}
                onChange={(e) => setAgencyColor(e.target.value)}
                className="rounded-xl bg-background border-input text-foreground"
              />
              <div 
                className="w-8 h-8 rounded-full border border-border shadow-sm shrink-0"
                style={{ backgroundColor: agencyColor }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Accent color used for primary CTA buttons, calendar highlights, and borders in the portal.
            </p>
          </div>

          {/* Custom domain — not implemented. Rendered disabled rather than
              hidden: agencies ask for this on the first call, and an empty box
              that silently discards what they type is worse than a field that
              says plainly it isn't ready. Nothing here is submitted. */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="agency-domain" className="text-sm font-semibold text-foreground/50">
                White-Label Portal Domain
              </Label>
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Coming soon
              </span>
            </div>
            <Input
              id="agency-domain"
              type="text"
              disabled
              readOnly
              placeholder="e.g. portal.myagency.com"
              value=""
              className="cursor-not-allowed rounded-xl border-input bg-muted text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground">
              Serving client dashboards from your own domain isn&apos;t available yet. Your agency
              name, logo and accent colour above already apply everywhere.
            </p>
          </div>

          {/* Hide Branding Switch */}
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border mt-2 shadow-sm">
            <div className="flex flex-col gap-1 pr-4">
              <Label htmlFor="hide-branding" className="text-sm font-semibold text-foreground/80">
                Hide All Platform Branding
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Completely removes the &quot;Powered by&quot; footer badge from chatbot widgets. (Available on Pro & Business plans).
              </p>
            </div>
            <Switch
              id="hide-branding"
              checked={hideBranding}
              onCheckedChange={setHideBranding}
            />
          </div>

          {/* Save Button */}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-4 rounded-xl shadow-glow">
            <Loader loading={loading}>Save Branding Settings</Loader>
          </Button>
        </div>
      </form>
    </section>
  )
}

export default WhiteLabelBranding
