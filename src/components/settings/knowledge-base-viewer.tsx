'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw, FileText, AlertCircle, Loader2, Edit, Save, X, Brain,
  Sparkles, Upload, CheckCircle2, CircleDashed, Link2, FileUp,
  Info, HelpCircle, ArrowRight, Database, Zap
} from 'lucide-react'
import { useScrapeWebsite, useUpdateKnowledgeBase, useTrainChatbot, useUploadText } from '@/hooks/firecrawl/use-scrape'
import { TrainingSourcesSelector } from './training-sources-selector'
import { formatDistanceToNow } from 'date-fns'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Props = {
  domainId: string
  domainName: string
  knowledgeBase: string | null
  status: string | null
  updatedAt: Date | null
  plan?: string
  trainingSourcesUsed?: number
  trainingSourcesLimit?: number
  kbSizeMB?: number
  kbSizeLimit?: number
}

const KnowledgeBaseViewerV2 = ({
  domainId,
  domainName,
  knowledgeBase,
  status,
  updatedAt,
  plan = 'FREE',
  trainingSourcesUsed = 0,
  trainingSourcesLimit = 5,
  kbSizeMB = 0,
  kbSizeLimit = 1,
}: Props) => {
  const [showFull, setShowFull] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedMarkdown, setEditedMarkdown] = useState(knowledgeBase || '')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadText, setUploadText] = useState('')
  const [appendMode, setAppendMode] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type (txt or pdf)
    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (!isTxt && !isPdf) {
      setFileError('Only .txt and .pdf files are supported')
      return
    }

    const MAX = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX) {
      setFileError('File too large. Maximum 10MB')
      return
    }

    setSelectedFile(file)

    // For text files, read content
    if (isTxt) {
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result || '')
        setUploadText(text)
      }
      reader.onerror = () => setFileError('Failed to read file')
      reader.readAsText(file)
    }
  }

  const handleTextUpload = async () => {
    if (selectedFile?.type === 'application/pdf' || selectedFile?.name.toLowerCase().endsWith('.pdf')) {
      // TODO: Handle PDF upload
      setFileError('PDF upload will be implemented in next update')
      return
    }

    await onUpload(domainId, uploadText, appendMode)
    setUploadText('')
    setUploadDialogOpen(false)
    setSelectedFile(null)
    setFileError(null)
    setAppendMode(true)
  }

  // Calculate limits
  const sourcesRemaining = trainingSourcesLimit === Infinity
    ? Infinity
    : trainingSourcesLimit - trainingSourcesUsed
  const sourcesPercent = trainingSourcesLimit === Infinity
    ? 0
    : (trainingSourcesUsed / trainingSourcesLimit) * 100
  const kbPercent = (kbSizeMB / kbSizeLimit) * 100

  // Check completion status
  const hasKB = !!knowledgeBase && knowledgeBase.length >= 50
  const isUpToDate = hasEmbeddings && !!completedAt && !!updatedAt && new Date(completedAt) >= new Date(updatedAt)
  const step1Complete = status === 'scraped' || hasKB
  const step3Complete = isUpToDate || trainingStatus === 'completed'

  // Loading states
  if (status === 'scraping' || scraping) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Scraping Website...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Extracting content from <span className="font-semibold">{domainName}</span>. This usually takes 10-30 seconds.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Failed state
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
            We couldn&apos;t scrape <span className="font-semibold">{domainName}</span>. This might be due to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Website blocking automated access</li>
            <li>Invalid SSL certificate</li>
            <li>Rate limiting or website temporarily down</li>
          </ul>
          <Button onClick={() => onScrape(domainId)} disabled={scraping}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Scrape
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Empty state with onboarding
  if (!knowledgeBase) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Build Your Knowledge Base
          </CardTitle>
          <CardDescription>
            Train your AI chatbot with content from your website or custom documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Limits Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Training Sources</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Number of pages, PDFs, or text files you can use to train your chatbot
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {trainingSourcesUsed}
                </span>
                <span className="text-muted-foreground">
                  / {trainingSourcesLimit === Infinity ? '∞' : trainingSourcesLimit}
                </span>
              </div>
              <Progress value={sourcesPercent} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Knowledge Base Size</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Total size of all content stored for your chatbot
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {kbSizeMB.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  / {kbSizeLimit} MB
                </span>
              </div>
              <Progress value={kbPercent} className="h-2" />
            </div>
          </div>

          {/* Onboarding Steps */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Choose one or more ways to add content:</span>
            </div>

            <Tabs defaultValue="sources" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sources">
                  <Link2 className="w-4 h-4 mr-2" />
                  Select Pages
                </TabsTrigger>
                <TabsTrigger value="quick">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Scrape
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="space-y-4 mt-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Recommended: Select Specific Pages</h4>
                      <p className="text-sm text-muted-foreground">
                        Discover all pages on your website and choose exactly which ones to train on.
                        Perfect for controlling what your chatbot learns.
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>See all available pages before scraping</li>
                        <li>Select only relevant content (e.g., skip /admin, /cart)</li>
                        <li>Your {plan} plan allows up to {trainingSourcesLimit === Infinity ? 'unlimited' : trainingSourcesLimit} sources</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <TrainingSourcesSelector domainId={domainId} />
              </TabsContent>

              <TabsContent value="quick" className="space-y-4 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Quick Website Scrape</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically scrape the homepage of <span className="font-semibold">{domainName}</span>.
                      Fast, but only captures one page.
                    </p>
                  </div>
                </div>
                <Button onClick={() => onScrape(domainId)} disabled={scraping} size="lg" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Scrape Homepage Now
                </Button>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Upload Custom Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload .txt or .pdf files with product info, FAQs, documentation, or any custom content.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>Supported: .txt (plain text), .pdf (with text)</li>
                      <li>Max file size: 10 MB</li>
                      <li>Each file counts as 1 training source</li>
                    </ul>
                  </div>
                </div>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Upload Content</DialogTitle>
                      <DialogDescription>
                        Add .txt or .pdf files to your chatbot&apos;s knowledge base
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file-upload">Select File</Label>
                        <div className="flex items-center gap-2">
                          <input
                            id="file-upload"
                            type="file"
                            accept=".txt,.pdf,text/plain,application/pdf"
                            onChange={handleFileChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                          />
                        </div>
                        {selectedFile && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileUp className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">
                              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                        )}
                        {fileError && (
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {fileError}
                          </p>
                        )}
                      </div>

                      {selectedFile?.type === 'text/plain' && (
                        <>
                          <Textarea
                            placeholder="File content will appear here..."
                            value={uploadText}
                            onChange={(e) => setUploadText(e.target.value)}
                            className="min-h-[250px] font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            {uploadText.length.toLocaleString()} characters
                          </p>
                        </>
                      )}

                      <div className="flex items-center gap-2">
                        <Switch
                          id="append-mode"
                          checked={appendMode}
                          onCheckedChange={setAppendMode}
                          disabled={!knowledgeBase}
                        />
                        <Label htmlFor="append-mode" className="text-sm">
                          {knowledgeBase ? 'Append to existing content' : 'Append (no existing content yet)'}
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadDialogOpen(false)
                          setUploadText('')
                          setSelectedFile(null)
                          setFileError(null)
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleTextUpload}
                        disabled={uploading || !selectedFile || (selectedFile.type === 'text/plain' && uploadText.length < 50)}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Edit mode
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
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={updating}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updating}>
                {updating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedMarkdown}
            onChange={(e) => setEditedMarkdown(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {editedMarkdown.length.toLocaleString()} characters
          </p>
        </CardContent>
      </Card>
    )
  }

  // View mode with knowledge base
  const preview = knowledgeBase.slice(0, 1000)
  const displayText = showFull ? knowledgeBase : preview

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Knowledge Base Active
            </CardTitle>
            <CardDescription className="mt-1">
              {kbSizeMB.toFixed(2)} MB • {knowledgeBase.length.toLocaleString()} characters •{' '}
              {updatedAt && `Updated ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}`}
            </CardDescription>

            {/* Progress Steps */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className={`flex items-center gap-2 rounded-md border px-3 py-2 ${step1Complete ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-muted/30'}`}>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="font-medium">Content Added</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border bg-blue-50 dark:bg-blue-950/20 border-blue-200 px-3 py-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Add More Sources</span>
              </div>
              <div className={`flex items-center gap-2 rounded-md border px-3 py-2 ${step3Complete ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-muted/30'}`}>
                {step3Complete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <CircleDashed className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-medium">Train AI</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" onClick={() => onTrain(domainId, false)} disabled={training || step3Complete}>
              {training ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Training... {progress}%
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  {step3Complete ? 'Trained ✓' : 'Train AI'}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sources Used</span>
              <Badge variant={sourcesPercent > 80 ? 'destructive' : 'secondary'}>
                {trainingSourcesUsed} / {trainingSourcesLimit === Infinity ? '∞' : trainingSourcesLimit}
              </Badge>
            </div>
            {trainingSourcesLimit !== Infinity && <Progress value={sourcesPercent} className="h-1.5" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage Used</span>
              <Badge variant={kbPercent > 80 ? 'destructive' : 'secondary'}>
                {kbSizeMB.toFixed(2)} / {kbSizeLimit} MB
              </Badge>
            </div>
            <Progress value={kbPercent} className="h-1.5" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <TrainingSourcesSelector domainId={domainId} />
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Add More Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add More Content</DialogTitle>
                <DialogDescription>
                  Upload additional .txt or .pdf files
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload-2">Select File</Label>
                  <input
                    id="file-upload-2"
                    type="file"
                    accept=".txt,.pdf,text/plain,application/pdf"
                    onChange={handleFileChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileUp className="w-4 h-4 text-green-600" />
                      <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  )}
                  {fileError && (
                    <p className="text-sm text-destructive">{fileError}</p>
                  )}
                </div>

                {selectedFile?.type === 'text/plain' && (
                  <Textarea
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                )}

                <div className="flex items-center gap-2">
                  <Switch id="append-2" checked={appendMode} onCheckedChange={setAppendMode} />
                  <Label htmlFor="append-2">Append to existing content</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleTextUpload} disabled={uploading || !selectedFile}>
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content Preview */}
        <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/20 rounded-lg border max-h-[400px] overflow-y-auto">
          <ReactMarkdown>{displayText}</ReactMarkdown>
          {!showFull && knowledgeBase.length > 1000 && (
            <Button variant="link" onClick={() => setShowFull(true)} className="mt-2">
              Show More <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {showFull && (
            <Button variant="link" onClick={() => setShowFull(false)} className="mt-2">
              Show Less
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default KnowledgeBaseViewerV2
