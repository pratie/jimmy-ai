'use client'
import React, { useState, useEffect } from 'react'
import Section from '../section-label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Loader } from '../loader'
import { toast } from 'sonner'
import { onGetWhiteLabelSettings, onUpdateWhiteLabelSettings } from '@/actions/settings'

const WhiteLabelBranding = () => {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [agencyName, setAgencyName] = useState('ChatDock')
  const [agencyLogo, setAgencyLogo] = useState('')
  const [agencyColor, setAgencyColor] = useState('#0f172a')
  const [agencyDomain, setAgencyDomain] = useState('')
  const [hideBranding, setHideBranding] = useState(false)

  // Fetch current white label settings on load
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await onGetWhiteLabelSettings()
        if (res?.status === 200 && res.data) {
          setAgencyName(res.data.agencyName || 'ChatDock')
          setAgencyLogo(res.data.agencyLogo || '')
          setAgencyColor(res.data.agencyColor || '#0f172a')
          setAgencyDomain(res.data.agencyDomain || '')
          setHideBranding(res.data.hideBranding || false)
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
        agencyDomain: agencyDomain || null as any,
        hideBranding,
      })

      if (res?.status === 200) {
        toast.success(res.message || 'Branding updated successfully!')
      } else {
        toast.error(res?.message || 'Failed to update branding settings')
      }
    } catch (err) {
      console.error('Error saving white label settings:', err)
      toast.error('An error occurred. Please try again.')
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 border-t border-white/[0.04] pt-10">
      <div className="lg:col-span-1">
        <Section
          label="Agency Branding"
          message="White-label the transactional portals and widgets under your own name and style guidelines."
        />
      </div>
      <form onSubmit={handleSubmit} className="lg:col-span-4 space-y-6">
        <div className="lg:w-[500px] flex flex-col gap-5">
          {/* Agency Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="agency-name" className="text-sm font-semibold text-white/80">
              Agency/Company Name
            </Label>
            <Input
              id="agency-name"
              type="text"
              placeholder="e.g. Acme AI Solutions"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="rounded-xl bg-white/5 border-white/[0.08] text-white placeholder:text-white/30"
            />
            <p className="text-[11px] text-white/40">
              Replaces all default platform text (e.g. inside chatbot attribution footers).
            </p>
          </div>

          {/* Agency Logo */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="agency-logo" className="text-sm font-semibold text-white/80">
              Agency Logo URL
            </Label>
            <Input
              id="agency-logo"
              type="text"
              placeholder="https://yourdomain.com/logo.svg"
              value={agencyLogo}
              onChange={(e) => setAgencyLogo(e.target.value)}
              className="rounded-xl bg-white/5 border-white/[0.08] text-white placeholder:text-white/30"
            />
            <p className="text-[11px] text-white/40">
              Logo displayed at the top of client booking and payment portals.
            </p>
          </div>

          {/* Accent Theme Color */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="agency-color" className="text-sm font-semibold text-white/80">
              Portal Accent Color
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="agency-color-picker"
                type="color"
                value={agencyColor}
                onChange={(e) => setAgencyColor(e.target.value)}
                className="w-12 h-10 p-1 border border-white/[0.08] rounded-lg bg-white/5 cursor-pointer shrink-0"
              />
              <Input
                id="agency-color"
                type="text"
                value={agencyColor}
                onChange={(e) => setAgencyColor(e.target.value)}
                className="rounded-xl bg-white/5 border-white/[0.08] text-white"
              />
              <div 
                className="w-8 h-8 rounded-full border border-white/[0.08] shadow-sm shrink-0"
                style={{ backgroundColor: agencyColor }}
              />
            </div>
            <p className="text-[11px] text-white/40">
              Accent color used for primary CTA buttons, calendar highlights, and borders in the portal.
            </p>
          </div>

          {/* Custom domain */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="agency-domain" className="text-sm font-semibold text-white/80">
              White-Label Portal Domain
            </Label>
            <Input
              id="agency-domain"
              type="text"
              placeholder="e.g. portal.myagency.com"
              value={agencyDomain}
              onChange={(e) => setAgencyDomain(e.target.value)}
              className="rounded-xl bg-white/5 border-white/[0.08] text-white placeholder:text-white/30"
            />
            <p className="text-[11px] text-white/40">
              Point a CNAME record to `chatdock.io` to white-label client dashboards entirely.
            </p>
          </div>

          {/* Hide Branding Switch */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/[0.04] mt-2">
            <div className="flex flex-col gap-1 pr-4">
              <Label htmlFor="hide-branding" className="text-sm font-semibold text-white/80">
                Hide All Platform Branding
              </Label>
              <p className="text-[11px] text-white/40">
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
          <Button type="submit" className="bg-[#0071E3] hover:bg-[#0071E3]/90 text-white font-semibold mt-4 rounded-xl shadow-[0_4px_12px_rgba(0,113,227,0.3)]">
            <Loader loading={loading}>Save Branding Settings</Loader>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default WhiteLabelBranding
