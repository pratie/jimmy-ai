'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, FileText, AlertCircle, Loader2, Edit, Save, X, Brain, Sparkles, Upload, CheckCircle2, CircleDashed } from 'lucide-react'
import { useScrapeWebsite, useUpdateKnowledgeBase, useTrainChatbot, useUploadText } from '@/hooks/firecrawl/use-scrape'
import { formatDistanceToNow } from 'date-fns'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  const [appendMode, setAppendMode] = useState(true)
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [fileError, setFileError] = useState<string | null>(null)
  const { onScrape, loading: scraping } = useScrapeWebsite()
  const { onUpdate, loading: updating } = useUpdateKnowledgeBase()
  const { onTrain, loading: training, progress, status: trainingStatus, counts, hasEmbeddings, completedAt, kbUpdatedAt } = useTrainChatbot()
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
    await onUpload(domainId, uploadText, appendMode)
    setUploadText('')
    setUploadDialogOpen(false)
    setSelectedFileName('')
    setFileError(null)
    setAppendMode(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFileName(file.name)

    // Validate type and size (10MB max aligns with server validateContent)
    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
    const MAX = 10 * 1024 * 1024
    if (!isTxt) {
      setFileError('Only .txt files are supported')
      return
    }
    if (file.size > MAX) {
      setFileError('File too large. Max 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      setUploadText(text)
    }
    reader.onerror = () => setFileError('Failed to read file')
    reader.readAsText(file)
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
          <div className="flex gap-2 flex-wrap">
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
                    Add custom text content to your chatbot&apos;s knowledge base. This will be appended to existing content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="txt-file">Select a .txt file (optional)</Label>
                    <input id="txt-file" type="file" accept=".txt,text/plain" onChange={handleFileChange} />
                    {selectedFileName && (
                      <p className="text-xs text-muted-foreground">Selected: {selectedFileName}</p>
                    )}
                    {fileError && (
                      <p className="text-xs text-destructive">{fileError}</p>
                    )}
                  </div>
                  <Textarea
                    placeholder="Paste your content here... (markdown supported, minimum 50 characters, max 10MB)"
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {uploadText.length.toLocaleString()} characters
                  </p>
                  <div className="flex items-center gap-2">
                    <Switch id="append-mode" checked={appendMode} onCheckedChange={setAppendMode} disabled={!knowledgeBase} />
                    <Label htmlFor="append-mode" className="text-sm">
                      {knowledgeBase ? 'Append to existing content' : 'Append (no existing content)'}
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadDialogOpen(false)
                      setUploadText('')
                      setSelectedFileName('')
                      setFileError(null)
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
  const hasKB = !!knowledgeBase && knowledgeBase.length >= 50
  const step1Done = status === 'scraped' || hasKB
  const isUpToDate = hasEmbeddings && !!completedAt && !!updatedAt && new Date(completedAt) >= new Date(updatedAt)
  const step3Done = isUpToDate || trainingStatus === 'completed'

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
            {/* Step Checklist */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5">
                {step1Done ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <CircleDashed className="w-4 h-4 text-muted-foreground" />
                )}
                <span>1) Scrape Website</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5">
                <Sparkles className="w-4 h-4 text-interactive-blue" />
                <span>2) Upload .txt (optional)</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5">
                {step3Done ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <CircleDashed className="w-4 h-4 text-muted-foreground" />
                )}
                <span>3) Train Chatbot</span>
              </div>
            </div>
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
            {/* Optional .txt upload even when KB exists */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Text
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Text Content</DialogTitle>
                  <DialogDescription>
                    Add or replace text content in your chatbot&apos;s knowledge base.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="txt-file-2">Select a .txt file (optional)</Label>
                    <input id="txt-file-2" type="file" accept=".txt,text/plain" onChange={handleFileChange} />
                    {selectedFileName && (
                      <p className="text-xs text-muted-foreground">Selected: {selectedFileName}</p>
                    )}
                    {fileError && (
                      <p className="text-xs text-destructive">{fileError}</p>
                    )}
                  </div>
                  <Textarea
                    placeholder="Paste your content here... (markdown supported, minimum 50 characters, max 10MB)"
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {uploadText.length.toLocaleString()} characters
                  </p>
                  <div className="flex items-center gap-2">
                    <Switch id="append-mode-2" checked={appendMode} onCheckedChange={setAppendMode} />
                    <Label htmlFor="append-mode-2" className="text-sm">
                      Append to existing content
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadDialogOpen(false)
                      setUploadText('')
                      setSelectedFileName('')
                      setFileError(null)
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-interactive-blue hover:bg-interactive-blue/90 text-text-primary border-2 border-interactive-blue/40"
                    disabled={training || trainingStatus === 'processing' || !knowledgeBase || knowledgeBase.length < 50 || isUpToDate}
                  >
                    {training ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    {isUpToDate ? 'Up to date' : (training || trainingStatus === 'processing' ? 'Training...' : 'Train Chatbot')}
                  </Button>
                  {isUpToDate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTrain(domainId, true)}
                    >
                      Force retrain
                    </Button>
                  )}
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-interactive-blue" />
                    Train Chatbot
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onTrain(domainId)}
                    className="bg-interactive-blue hover:bg-interactive-blue/90 text-text-primary border-2 border-interactive-blue/40"
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
        {(training || trainingStatus === 'processing') && (
          <div className="space-y-2 p-4 rounded-md border bg-muted/30">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Training in progress...</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{counts.processed} / {counts.total || Math.ceil((knowledgeBase?.length || 0) / 500)} chunks</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded">
              <div className="h-2 bg-interactive-blue rounded" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-lg max-h-[500px] overflow-y-auto overflow-x-auto">
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
