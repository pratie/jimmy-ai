'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, FileText, AlertCircle, Loader2, Edit, Save, X } from 'lucide-react'
import { useScrapeWebsite, useUpdateKnowledgeBase } from '@/hooks/firecrawl/use-scrape'
import { formatDistanceToNow } from 'date-fns'

type Props = {
  domainId: string
  domainName: string
  knowledgeBase: string | null
  status: string | null
  updatedAt: Date | null
}

const KnowledgeBaseViewer = ({
  domainId,
  domainName,
  knowledgeBase,
  status,
  updatedAt,
}: Props) => {
  const [showFull, setShowFull] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedMarkdown, setEditedMarkdown] = useState(knowledgeBase || '')
  const { onScrape, loading: scraping } = useScrapeWebsite()
  const { onUpdate, loading: updating } = useUpdateKnowledgeBase()

  // Update edited markdown when knowledge base changes
  React.useEffect(() => {
    setEditedMarkdown(knowledgeBase || '')
  }, [knowledgeBase])

  const handleSave = async () => {
    await onUpdate(domainId, editedMarkdown)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedMarkdown(knowledgeBase || '')
    setIsEditing(false)
  }

  // Status: Scraping
  if (status === 'scraping' || scraping) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Scraping Website...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We're extracting content from <span className="font-semibold">{domainName}</span>.
            This usually takes 10-30 seconds.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Status: Failed
  if (status === 'failed' || (!knowledgeBase && status !== 'pending')) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Scraping Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We couldn't scrape <span className="font-semibold">{domainName}</span>.
            This might be due to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Website blocking automated access (bot protection)</li>
            <li>Invalid or expired SSL certificate</li>
            <li>Rate limiting from the website</li>
            <li>Website temporarily down or unreachable</li>
            <li>Domain not publicly accessible</li>
          </ul>
          <Button onClick={() => onScrape(domainId)} disabled={scraping}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Scrape
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Status: No knowledge base yet
  if (!knowledgeBase) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Website Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            No knowledge base yet. Click below to scrape <span className="font-semibold">{domainName}</span> and
            extract content for your chatbot to use in conversations.
          </p>
          <Button onClick={() => onScrape(domainId)} disabled={scraping}>
            <FileText className="w-4 h-4 mr-2" />
            Scrape Website
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show knowledge base (edit mode)
  if (isEditing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Knowledge Base
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updating}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updating}>
                {updating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedMarkdown}
            onChange={(e) => setEditedMarkdown(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Enter markdown content..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            {editedMarkdown.length.toLocaleString()} characters
          </p>
        </CardContent>
      </Card>
    )
  }

  // Show knowledge base (view mode)
  const preview = knowledgeBase.slice(0, 1000)
  const displayText = showFull ? knowledgeBase : preview

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Website Knowledge Base
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {knowledgeBase.length.toLocaleString()} characters scraped
              {updatedAt &&
                ` • Updated ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScrape(domainId)}
              disabled={scraping}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${scraping ? 'animate-spin' : ''}`}
              />
              Re-scrape
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-lg max-h-[500px] overflow-y-auto">
          <ReactMarkdown>{displayText}</ReactMarkdown>
          {!showFull && knowledgeBase.length > 1000 && (
            <p className="text-muted-foreground italic mt-4">
              [Content preview - click "Show Full Content" below to see everything]
            </p>
          )}
        </div>
        {knowledgeBase.length > 1000 && (
          <Button variant="ghost" onClick={() => setShowFull(!showFull)}>
            {showFull ? 'Show Preview Only' : 'Show Full Content'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default KnowledgeBaseViewer