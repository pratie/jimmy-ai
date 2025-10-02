'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, FileText, AlertCircle, Loader2, Edit, Save, X, Brain, Sparkles, Upload } from 'lucide-react'
import { useScrapeWebsite, useUpdateKnowledgeBase, useTrainChatbot, useUploadText } from '@/hooks/firecrawl/use-scrape'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadText, setUploadText] = useState('')
  const { onScrape, loading: scraping } = useScrapeWebsite()
  const { onUpdate, loading: updating } = useUpdateKnowledgeBase()
  const { onTrain, loading: training } = useTrainChatbot()
  const { onUpload, loading: uploading } = useUploadText()

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
            We&apos;re extracting content from <span className="font-semibold">{domainName}</span>.
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
            We couldn&apos;t scrape <span className="font-semibold">{domainName}</span>.
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

  const handleTextUpload = async () => {
    await onUpload(domainId, uploadText, true)
    setUploadText('')
    setUploadDialogOpen(false)
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
            No knowledge base yet. Scrape <span className="font-semibold">{domainName}</span> or upload text content.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => onScrape(domainId)} disabled={scraping}>
              <FileText className="w-4 h-4 mr-2" />
              Scrape Website
            </Button>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Text
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Text Content</DialogTitle>
                  <DialogDescription>
                    Add custom text content to your chatbot's knowledge base. This will be appended to existing content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste your content here... (markdown supported, minimum 50 characters, max 10MB)"
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {uploadText.length.toLocaleString()} characters
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadDialogOpen(false)
                      setUploadText('')
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTextUpload}
                    disabled={uploading || uploadText.length < 50}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
          <div className="flex gap-2 flex-wrap">
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={training}
                >
                  {training ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  {training ? 'Training...' : 'Train Chatbot'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Train Chatbot with RAG Embeddings
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      This will process your knowledge base and create semantic embeddings for AI-powered retrieval.
                    </p>
                    <p className="font-semibold">What happens next:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Your content will be split into {Math.ceil((knowledgeBase?.length || 0) / 500)} chunks</li>
                      <li>Each chunk will be embedded using OpenAI (text-embedding-3-small)</li>
                      <li>Embeddings will be stored in your vector database</li>
                      <li>Your chatbot will use semantic search for better responses</li>
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      Training typically takes 10-30 seconds depending on content size.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onTrain(domainId)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Start Training
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-lg max-h-[500px] overflow-y-auto">
          <ReactMarkdown>{displayText}</ReactMarkdown>
          {!showFull && knowledgeBase.length > 1000 && (
            <p className="text-muted-foreground italic mt-4">
              [Content preview - click &quot;Show Full Content&quot; below to see everything]
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