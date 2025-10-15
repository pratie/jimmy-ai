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
  const snippet = `<script defer src="${appUrl}/embed.min.js" id="${id}" data-app-origin="${appUrl}"></script>`

  return (
    <div className="mt-10 flex flex-col gap-5 items-start">
      <Section
        label="Code snippet"
        message="Paste this in <head> (defer) or before </body> on your site."
      />
      <div className="bg-cream px-6 py-4 rounded-lg relative w-full overflow-x-auto">
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
