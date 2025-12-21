'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw, FileText, AlertCircle, Loader2, Edit, Save, X, Brain,
  Upload, CheckCircle2, CircleDashed, Link2, FileUp,
  HelpCircle, ArrowRight, Database, Eye, ChevronDown, ChevronUp, Globe
} from 'lucide-react'
import { useScrapeWebsite, useUpdateKnowledgeBase, useTrainChatbot, useUploadText, useScrapeSelected, useUploadPdf } from '@/hooks/firecrawl/use-scrape'
import { TrainingSourcesSelector } from './training-sources-selector'
import { formatDistanceToNow } from 'date-fns'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// Dialog imports removed (no longer used in simplified KB UI)
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  const [showContent, setShowContent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedMarkdown, setEditedMarkdown] = useState(knowledgeBase || '')
  const [uploadText, setUploadText] = useState('')
  const [singleUrl, setSingleUrl] = useState('')
  const [appendMode, setAppendMode] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const { onScrape, loading: scraping } = useScrapeWebsite()
  const { onScrapeSelected, loading: scrapingSelected } = useScrapeSelected()
  const { onUpdate, loading: updating } = useUpdateKnowledgeBase()
  const { onTrain, loading: training, progress, status: trainingStatus, hasEmbeddings, completedAt } = useTrainChatbot()
  const { onUpload, loading: uploading } = useUploadText()
  const { onUploadPdf, loading: uploadingPdf } = useUploadPdf()

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
    setPdfBase64(null)
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type (txt or pdf)
    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (!isTxt && !isPdf) {
      setFileError('Only .txt or .pdf files are supported at the moment')
      setSelectedFile(null)
      return
    }

    const MAX = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX) {
      setFileError('File too large. Maximum 50MB')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)

    if (isPdf) {
      // Read as data URL and strip prefix to get base64 payload
      const reader = new FileReader()
      reader.onload = () => {
        const result = String(reader.result || '')
        const base64 = result.includes(',') ? result.split(',')[1] || '' : result
        if (!base64) {
          setFileError('Failed to read PDF')
          setPdfBase64(null)
          return
        }
        setPdfBase64(base64)
        setUploadText('') // Clear any text content preview when switching to PDF
      }
      reader.onerror = () => {
        setFileError('Failed to read PDF')
        setPdfBase64(null)
      }
      reader.readAsDataURL(file)
      return
    }

    // For text files, read content
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      setUploadText(text)
    }
    reader.onerror = () => setFileError('Failed to read file')
    reader.readAsText(file)
  }

  const handleTextUpload = async () => {
    await onUpload(domainId, uploadText, appendMode)
    setUploadText('')
    setSelectedFile(null)
    setPdfBase64(null)
    setFileError(null)
    setAppendMode(true)
  }

  const handlePdfUpload = async () => {
    if (!pdfBase64 || !selectedFile) return
    await onUploadPdf(domainId, pdfBase64, selectedFile.name, appendMode)
    setPdfBase64(null)
    setSelectedFile(null)
    setFileError(null)
    setAppendMode(true)
  }

  const handleScrapeSingle = async () => {
    if (!singleUrl || singleUrl.trim().length < 5) return
    await onScrapeSelected(domainId, [singleUrl.trim()])
    setSingleUrl('')
  }

  // Calculate limits
  const sourcesRemaining = trainingSourcesLimit === Infinity
    ? Infinity
    : trainingSourcesLimit - trainingSourcesUsed
  const sourcesPercent = trainingSourcesLimit === Infinity
    ? 0
    : (trainingSourcesUsed / trainingSourcesLimit) * 100
  const kbPercent = (kbSizeMB / kbSizeLimit) * 100
  const isSelectedTextFile = selectedFile
    ? selectedFile.type === 'text/plain' || selectedFile.name.toLowerCase().endsWith('.txt')
    : false
  const isSelectedPdfFile = selectedFile
    ? selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
    : false

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
          {/* Plan Limits Display - Reimagined for High-Ticket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-sauce-purple to-sauce-purple-dark rounded-2xl text-white shadow-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain className="w-24 h-24" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Agent Knowledge Base</span>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px]">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Training Sources</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3.5 h-3.5 text-white/50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Number of pages, PDFs, or text files you can use to train your autonomous agent
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading">
                  {trainingSourcesUsed}
                </span>
                <span className="text-white/50 text-sm">
                  / {trainingSourcesLimit === Infinity ? '∞' : trainingSourcesLimit}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${sourcesPercent}%` }}
                />
              </div>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Memory Capacity</span>
                <Eye className="w-3.5 h-3.5 text-white/30" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Digital Brain Size</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3.5 h-3.5 text-white/50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Total size of all extracted knowledge currently stored in your agent's brain
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading">
                  {kbSizeMB.toFixed(2)}
                </span>
                <span className="text-white/50 text-sm">
                  / {kbSizeLimit} MB
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${kbPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tab-based Training Methods */}
          <Tabs defaultValue="websites" className="w-full">
            <TabsList className="inline-flex w-auto self-start gap-1 rounded-xl bg-sauce-grid/50 p-1 border border-sauce-grid/20 h-auto">
              <TabsTrigger value="websites" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Websites</span>
                <span className="sm:hidden">Web</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Text
              </TabsTrigger>
              <TabsTrigger value="file" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm flex items-center gap-2">
                <FileUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">File Upload</span>
                <span className="sm:hidden">File</span>
              </TabsTrigger>
            </TabsList>

            {/* Websites Tab */}
            <TabsContent value="websites" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Add content from websites</p>
                <Badge variant="secondary">
                  {sourcesRemaining === Infinity ? 'Unlimited' : `${sourcesRemaining} left`}
                </Badge>
              </div>

              <div className="space-y-4 p-6 rounded-lg border bg-white/90 backdrop-blur-sm">
                {/* Default Domain Display */}
                <div className="space-y-2 pb-4 border-b border-gray-100">
                  <Label className="text-sm font-semibold">Primary Website</Label>
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <div className="p-2 bg-white rounded-full border border-blue-100 shadow-sm">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{domainName}</p>
                      <p className="text-xs text-gray-500">Default source for crawling</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-semibold">Website Pages</Label>
                  <p className="text-xs text-muted-foreground mb-2">Discover and select specific pages to train on</p>
                  <TrainingSourcesSelector domainId={domainId} />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Scrape Single URL</Label>
                  <p className="text-xs text-muted-foreground mb-2">Add content from a specific page</p>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/page"
                      value={singleUrl}
                      onChange={(e) => setSingleUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleScrapeSingle} disabled={!singleUrl || scrapingSelected}>
                      {scrapingSelected ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      Scrape
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Paste or type text directly</p>

              <div className="space-y-4 p-6 rounded-lg border bg-white/90 backdrop-blur-sm">
                <Textarea
                  placeholder="Paste your content here... (minimum 50 characters)"
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="append-mode-text-empty" checked={appendMode} onCheckedChange={setAppendMode} />
                    <Label htmlFor="append-mode-text-empty" className="text-sm">Append to existing content</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {uploadText.length} / 50 minimum characters
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleTextUpload} disabled={uploading || uploadText.trim().length < 50} size="lg">
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Text
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* File Upload Tab */}
            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Upload .txt or .pdf files (scanned PDFs not yet supported)</p>
                <Badge variant="outline" className="text-xs">50MB max</Badge>
              </div>

              <div className="space-y-4 p-6 rounded-lg border bg-white/90 backdrop-blur-sm">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Select File</Label>
                  <input
                    id="file-upload-empty"
                    type="file"
                    accept=".txt,.pdf,text/plain,application/pdf"
                    onChange={handleFileChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                      <FileUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <span className="text-muted-foreground">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  )}
                  {fileError && (
                    <p className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded">{fileError}</p>
                  )}
                </div>

                {isSelectedTextFile && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Preview & Edit</Label>
                      <Textarea
                        value={uploadText}
                        onChange={(e) => setUploadText(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="append-mode-file-empty" checked={appendMode} onCheckedChange={setAppendMode} />
                      <Label htmlFor="append-mode-file-empty" className="text-sm">Append to existing content</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadText('')
                          setSelectedFile(null)
                          setFileError(null)
                        }}
                        disabled={uploading}
                      >
                        Clear
                      </Button>
                      <Button onClick={handleTextUpload} disabled={uploading || !selectedFile} size="lg">
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload File
                      </Button>
                    </div>
                  </>
                )}

                {isSelectedPdfFile && (
                  <>
                    <div className="flex items-center gap-2">
                      <Switch id="append-mode-file-pdf" checked={appendMode} onCheckedChange={setAppendMode} />
                      <Label htmlFor="append-mode-file-pdf" className="text-sm">Append to existing content</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We extract text from this PDF. Image-only/scanned PDFs will fail until OCR is added.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPdfBase64(null)
                          setSelectedFile(null)
                          setFileError(null)
                        }}
                        disabled={uploadingPdf}
                      >
                        Clear
                      </Button>
                      <Button onClick={handlePdfUpload} disabled={uploadingPdf || !pdfBase64} size="lg">
                        {uploadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload PDF
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
  const sourcesPercent = trainingSourcesLimit && trainingSourcesLimit !== Infinity
    ? Math.min(100, (trainingSourcesUsed / trainingSourcesLimit) * 100)
    : 0
  const kbPercent = kbSizeLimit ? Math.min(100, (kbSizeMB / kbSizeLimit) * 100) : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              Knowledge Base Active
            </CardTitle>
            <CardDescription className="mt-1 text-xs md:text-sm">
              {kbSizeMB.toFixed(2)} MB • {knowledgeBase.length.toLocaleString()} chars •{' '}
              {updatedAt && `Updated ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}`}
            </CardDescription>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="text-xs md:text-sm">
              <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Edit
            </Button>
            <Button size="sm" onClick={() => onTrain(domainId, false)} disabled={training || step3Complete} className="text-xs md:text-sm">
              {training ? (
                <>
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Training... {progress}%</span>
                  <span className="sm:hidden">{progress}%</span>
                </>
              ) : (
                <>
                  <Brain className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  {step3Complete ? '✓' : 'Train AI'}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Stats (Glassmorphism look) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-sauce-grid/20 bg-sauce-grid/10">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sauce-gray/60">Sources Used</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sauce-black">{trainingSourcesUsed}</span>
                <span className="text-[10px] font-medium text-sauce-gray/40">/ {trainingSourcesLimit === Infinity ? '∞' : trainingSourcesLimit}</span>
              </div>
            </div>
            {trainingSourcesLimit !== Infinity && (
              <div className="h-1 bg-sauce-grid rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500", sourcesPercent > 80 ? 'bg-accent-red' : 'bg-sauce-purple')}
                  style={{ width: `${sourcesPercent}%` }}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sauce-gray/60">Total Storage</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sauce-black">{kbSizeMB.toFixed(2)}</span>
                <span className="text-[10px] font-medium text-sauce-gray/40">/ {kbSizeLimit} MB</span>
              </div>
            </div>
            <div className="h-1 bg-sauce-grid rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", kbPercent > 80 ? 'bg-accent-red' : 'bg-sauce-purple')}
                style={{ width: `${kbPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab-based Training Methods */}
        <Tabs defaultValue="websites" className="w-full">
          <TabsList className="inline-flex w-auto self-start gap-1 rounded-xl bg-sauce-grid/50 p-1 border border-sauce-grid/20 h-auto">
            <TabsTrigger value="websites" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Websites</span>
              <span className="sm:hidden">Web</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Text
            </TabsTrigger>
            <TabsTrigger value="file" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm flex items-center gap-2">
              <FileUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">File Upload</span>
              <span className="sm:hidden">File</span>
            </TabsTrigger>
          </TabsList>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Add more content from websites</p>
              <Badge variant="secondary">
                {sourcesRemaining === Infinity ? 'Unlimited' : `${sourcesRemaining} left`}
              </Badge>
            </div>

            <div className="space-y-4 p-6 rounded-lg border bg-white/90 backdrop-blur-sm">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Collect Multiple Links</Label>
                <p className="text-xs text-muted-foreground mb-2">Discover and select multiple pages from your website</p>
                <TrainingSourcesSelector domainId={domainId} />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Scrape Single URL</Label>
                <p className="text-xs text-muted-foreground mb-2">Add content from a specific page</p>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/page"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleScrapeSingle} disabled={!singleUrl || scrapingSelected}>
                    {scrapingSelected ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Scrape
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">Paste or type additional text</p>

            <div className="space-y-4 p-6 rounded-lg border bg-white/90 backdrop-blur-sm">
              <Textarea
                placeholder="Paste your content here... (minimum 50 characters)"
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="append-mode-text-active" checked={appendMode} onCheckedChange={setAppendMode} />
                  <Label htmlFor="append-mode-text-active" className="text-sm">Append to existing content</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {uploadText.length} / 50 minimum characters
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleTextUpload} disabled={uploading || uploadText.trim().length < 50} size="lg">
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Text
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* File Upload Tab */}
          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Upload .txt or .pdf files (scanned PDFs not yet supported)</p>
              <Badge variant="outline" className="text-xs">50MB max</Badge>
            </div>

            <div className="space-y-4 p-6 rounded-lg border bg-white/90 backdrop-blur-sm">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select File</Label>
                <input
                  id="file-upload-active"
                  type="file"
                  accept=".txt,.pdf,text/plain,application/pdf"
                  onChange={handleFileChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                    <FileUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-muted-foreground">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                )}
                {fileError && (
                  <p className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded">{fileError}</p>
                )}
              </div>

              {isSelectedTextFile && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Preview & Edit</Label>
                    <Textarea
                      value={uploadText}
                      onChange={(e) => setUploadText(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="append-mode-file-active" checked={appendMode} onCheckedChange={setAppendMode} />
                    <Label htmlFor="append-mode-file-active" className="text-sm">Append to existing content</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadText('')
                        setSelectedFile(null)
                        setFileError(null)
                      }}
                      disabled={uploading}
                    >
                      Clear
                    </Button>
                    <Button onClick={handleTextUpload} disabled={uploading || !selectedFile} size="lg">
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload File
                    </Button>
                  </div>
                </>
              )}

              {isSelectedPdfFile && (
                <>
                  <div className="flex items-center gap-2">
                    <Switch id="append-mode-file-active-pdf" checked={appendMode} onCheckedChange={setAppendMode} />
                    <Label htmlFor="append-mode-file-active-pdf" className="text-sm">Append to existing content</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We extract text from this PDF. Image-only/scanned PDFs will fail until OCR is added.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPdfBase64(null)
                        setSelectedFile(null)
                        setFileError(null)
                      }}
                      disabled={uploadingPdf}
                    >
                      Clear
                    </Button>
                    <Button onClick={handlePdfUpload} disabled={uploadingPdf || !pdfBase64} size="lg">
                      {uploadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload PDF
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Content Preview - Collapsible */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowContent(!showContent)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {showContent ? 'Hide' : 'View'} Knowledge Base Content
            </span>
            {showContent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {showContent && (
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default KnowledgeBaseViewerV2
