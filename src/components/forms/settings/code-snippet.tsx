'use client'
import Section from '@/components/section-label'
import { useToast } from '@/components/ui/use-toast'
import { Copy } from 'lucide-react'
import React from 'react'

type Props = {
  id: string
}

const CodeSnippet = ({ id }: Props) => {
  const { toast } = useToast()
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

  // Smallest embed: one‑tag script loader (recommended)
  const [margin, setMargin] = React.useState(24)
  const [size, setSize] = React.useState<'sm'|'md'>('md')
  const snippet = `<script defer src="${appUrl}/embed.min.js" id="${id}" data-app-origin="${appUrl}" data-margin="${margin}" data-size="${size}"></script>`

  return (
    <div className="mt-10 flex flex-col gap-5 items-start">
      <Section
        label="Code snippet"
        message="Paste this in <head> (defer) or before </body> on your site."
      />
      <div className="w-full flex items-center gap-3">
        <label className="text-sm">Margin</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={margin}
          onChange={(e)=>setMargin(parseInt(e.target.value))}
        >
          <option value={24}>24 px</option>
          <option value={32}>32 px</option>
          <option value={48}>48 px</option>
        </select>
        <label className="text-sm">Bubble</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={size}
          onChange={(e)=>setSize(e.target.value as 'sm'|'md')}
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
        </select>
      </div>
      <div className="bg-cream px-6 py-4 rounded-lg relative w-full overflow-x-auto mt-3">
        <Copy
          className="absolute top-5 right-5 text-brand-primary/60 hover:text-brand-primary cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(snippet)
            toast({
              title: 'Copied to clipboard',
              description: 'You can now paste the code inside your website',
            })
          }}
        />
        <pre className="whitespace-pre text-sm min-w-full">
          <code className="text-brand-primary/70">{snippet}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeSnippet
