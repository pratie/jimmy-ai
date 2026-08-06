'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw, FileText, AlertCircle, Loader2, Save, Brain,
  Upload, CheckCircle2, FileUp, Database, Globe, AlertTriangle,
} from 'lucide-react'
import { useScrapeWebsite, useTrainChatbot, useUploadText, useScrapeSelected, useUploadPdf } from '@/hooks/firecrawl/use-scrape'
import { TrainingSourcesSelector } from './training-sources-selector'
import { formatDistanceToNow } from 'date-fns'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** Mirrors `SyncStatus` in the schema. Every value here exists in the database. */
export type KnowledgeSyncStatus =
  | 'never_synced'
  | 'queued'
  | 'syncing'
  | 'synced'
  | 'partially_synced'
  | 'failed'

export type KnowledgeSummary = {
  documents: number
  chunks: number
  sources: { id: string; name: string; status: KnowledgeSyncStatus; lastSyncedAt: Date | null }[]
  failedSources: number
  syncingSources: number
}

type Props = {
  domainId: string
  domainName: string
  knowledge: KnowledgeSummary
  trainingSourcesUsed?: number
  trainingSourcesLimit?: number
  kbSizeMB?: number
  kbSizeLimit?: number
}

const PILL = 'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1'
const TONE = {
  good: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warn: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  error: 'bg-rose-50 text-rose-700 ring-rose-600/20',
} as const

const SOURCE_STATUS: Record<KnowledgeSyncStatus, { label: string; tone: keyof typeof TONE }> = {
  never_synced: { label: 'Not synced', tone: 'neutral' },
  queued: { label: 'Queued', tone: 'warn' },
  syncing: { label: 'Syncing', tone: 'warn' },
  synced: { label: 'Synced', tone: 'good' },
  partially_synced: { label: 'Partly synced', tone: 'warn' },
  failed: { label: 'Failed', tone: 'error' },
}

/**
 * The knowledge panel for one client.
 *
 * It used to decide what to say from `chatBot.knowledgeBase` — a markdown blob
 * the pre-rebuild schema stored on Domain. The rebuild replaced that blob with
 * `KnowledgeChunk` rows, so the field is permanently null and every client got
 * a red "Scraping Failed" no matter how well their crawl went. The status
 * vocabulary was stale too: it tested for `scraped` and `pending`, neither of
 * which `SyncStatus` has ever contained.
 *
 * So the panel now reports what is actually in the database. Indexed chunks
 * come first, because chunks are the only honest answer to "does this
 * assistant have anything to say" — a client with chunks is working, and is
 * never shown an error, even if one of several sources failed. The red failure
 * treatment is reserved for the one case that earns it: nothing indexed and a
 * source that failed trying.
 */
const KnowledgeBaseViewer = ({
  domainId,
  domainName,
  knowledge,
  trainingSourcesUsed = 0,
  trainingSourcesLimit = 5,
  kbSizeMB = 0,
  kbSizeLimit = 1,
}: Props) => {
  const [uploadText, setUploadText] = useState('')
  const [singleUrl, setSingleUrl] = useState('')
  const [appendMode, setAppendMode] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const { onScrape, loading: scraping } = useScrapeWebsite()
  const { onScrapeSelected, loading: scrapingSelected } = useScrapeSelected()
  const { onTrain, loading: training, progress } = useTrainChatbot()
  const { onUpload, loading: uploading } = useUploadText()
  const { onUploadPdf, loading: uploadingPdf } = useUploadPdf()

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
  const sourcesPercent = trainingSourcesLimit && trainingSourcesLimit !== Infinity
    ? Math.min(100, (trainingSourcesUsed / trainingSourcesLimit) * 100)
    : 0
  const kbPercent = kbSizeLimit ? Math.min(100, (kbSizeMB / kbSizeLimit) * 100) : 0
  const isSelectedTextFile = selectedFile
    ? selectedFile.type === 'text/plain' || selectedFile.name.toLowerCase().endsWith('.txt')
    : false
  const isSelectedPdfFile = selectedFile
    ? selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
    : false

  const { chunks, documents, sources, failedSources, syncingSources } = knowledge
  const failedNames = sources.filter((s) => s.status === 'failed').map((s) => s.name)
  // A crawl the operator just started is not yet reflected in the server data
  // this component was rendered with, so treat an in-flight request as work in
  // progress rather than leaving the previous state on screen.
  const inFlight = scraping || scrapingSelected
  const lastSyncedAt = sources.reduce<Date | null>((latest, source) => {
    if (!source.lastSyncedAt) return latest
    const at = new Date(source.lastSyncedAt)
    return !latest || at > latest ? at : latest
  }, null)

  const state: 'healthy' | 'partial' | 'indexing' | 'failed' | 'empty' =
    chunks > 0
      ? failedSources > 0 ? 'partial' : 'healthy'
      : inFlight || syncingSources > 0
        ? 'indexing'
        : failedSources > 0
          ? 'failed'
          : 'empty'

  const statusCard = {
    healthy: {
      tone: 'border-emerald-200 bg-emerald-50/60',
      icon: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />,
      title: 'Knowledge base is live',
      body: (
        <>
          <span className="font-bold tabular-nums">{chunks.toLocaleString()}</span> passages indexed
          from <span className="font-bold tabular-nums">{documents.toLocaleString()}</span>{' '}
          {documents === 1 ? 'document' : 'documents'}. The assistant answers from this content.
        </>
      ),
    },
    partial: {
      tone: 'border-amber-200 bg-amber-50/70',
      icon: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />,
      title: 'Working, but some sources did not sync',
      body: (
        <>
          <span className="font-bold tabular-nums">{chunks.toLocaleString()}</span> passages indexed
          from <span className="font-bold tabular-nums">{documents.toLocaleString()}</span>{' '}
          {documents === 1 ? 'document' : 'documents'} — the assistant works. But{' '}
          <span className="font-bold tabular-nums">{failedSources}</span>{' '}
          {failedSources === 1 ? 'source' : 'sources'} failed to sync
          {failedNames.length > 0 && <> ({failedNames.join(', ')})</>}, so anything only they covered
          is missing.
        </>
      ),
    },
    indexing: {
      tone: 'border-slate-200 bg-slate-50',
      icon: <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[#5b5ce2]" />,
      title: 'Indexing in progress',
      body: (
        <>
          Reading {domainName} and turning it into passages the assistant can search. This usually
          takes under a minute — refresh to see the result.
        </>
      ),
    },
    failed: {
      tone: 'border-rose-200 bg-rose-50/70',
      icon: <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />,
      title: 'Scraping failed',
      body: (
        <>
          Nothing has been indexed for <span className="font-bold">{domainName}</span>
          {failedNames.length > 0 && <> — {failedNames.join(', ')} could not be read</>}. Common
          causes: the site blocks automated access, an invalid SSL certificate, or rate limiting
          while the site was busy.
        </>
      ),
    },
    empty: {
      tone: 'border-slate-200 bg-slate-50',
      icon: <Database className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />,
      title: 'Nothing added yet',
      body: (
        <>
          The assistant has no content to answer from. Add {domainName}&apos;s pages below, paste
          text, or upload a PDF — the first source takes about a minute to index.
        </>
      ),
    },
  }[state]

  return (
    <div className="flex flex-col gap-6">
      {/* Status — the one place the panel says what is actually true */}
      <div className={cn('rounded-2xl border p-5', statusCard.tone)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2.5">
            {statusCard.icon}
            <div className="min-w-0">
              <p className="text-[13px] font-black tracking-tight text-slate-900">
                {statusCard.title}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-slate-600">{statusCard.body}</p>
              {lastSyncedAt && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Last synced {formatDistanceToNow(lastSyncedAt, { addSuffix: true })}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {(state === 'failed' || state === 'partial') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScrape(domainId)}
                disabled={scraping}
                className="rounded-lg border-slate-200 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50"
              >
                {scraping
                  ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
                Retry crawl
              </Button>
            )}
            {chunks > 0 && (
              <Button
                size="sm"
                onClick={() => onTrain(domainId, false)}
                disabled={training}
                className="rounded-lg bg-[#5b5ce2] text-xs font-bold text-white hover:bg-[#4c4dd6]"
              >
                {training ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Retraining {progress}%
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-3.5 w-3.5" />
                    Retrain
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Per-source truth. One failed source among many is a line item here,
          not a verdict on the whole knowledge base. */}
      {sources.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sources</p>
            <span className="text-[11px] tabular-nums text-slate-400">
              {sources.length} {sources.length === 1 ? 'source' : 'sources'}
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {sources.map((source) => {
              const meta = SOURCE_STATUS[source.status]
              return (
                <li key={source.id} className="flex items-center gap-3 px-5 py-3">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-800">
                    {source.name}
                  </span>
                  {source.lastSyncedAt && (
                    <span className="hidden shrink-0 text-[11px] text-slate-400 sm:inline">
                      {formatDistanceToNow(new Date(source.lastSyncedAt), { addSuffix: true })}
                    </span>
                  )}
                  <span className={cn(PILL, TONE[meta.tone])}>{meta.label}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Quota read-outs */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Training sources</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black tabular-nums text-slate-900">{trainingSourcesUsed}</span>
              <span className="text-[10px] font-medium tabular-nums text-slate-400">
                / {trainingSourcesLimit === Infinity ? '∞' : trainingSourcesLimit}
              </span>
            </div>
          </div>
          {trainingSourcesLimit !== Infinity && (
            <div className="h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn('h-full transition-all duration-500', sourcesPercent > 80 ? 'bg-rose-500' : 'bg-[#5b5ce2]')}
                style={{ width: `${sourcesPercent}%` }}
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Storage used</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black tabular-nums text-slate-900">{kbSizeMB.toFixed(2)}</span>
              <span className="text-[10px] font-medium tabular-nums text-slate-400">/ {kbSizeLimit} MB</span>
            </div>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-full transition-all duration-500', kbPercent > 80 ? 'bg-rose-500' : 'bg-[#5b5ce2]')}
              style={{ width: `${kbPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add content */}
      <Tabs defaultValue="websites" className="w-full">
        <TabsList className="inline-flex h-auto w-auto gap-1 self-start rounded-xl border border-slate-200 bg-white p-1">
          <TabsTrigger value="websites" className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-slate-500 data-[state=active]:bg-[#111827] data-[state=active]:text-white">
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Websites</span>
            <span className="sm:hidden">Web</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-slate-500 data-[state=active]:bg-[#111827] data-[state=active]:text-white">
            <FileText className="h-3.5 w-3.5" />
            Text
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-slate-500 data-[state=active]:bg-[#111827] data-[state=active]:text-white">
            <FileUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">File upload</span>
            <span className="sm:hidden">File</span>
          </TabsTrigger>
        </TabsList>

        {/* Websites Tab */}
        <TabsContent value="websites" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Add content from websites</p>
            <Badge variant="secondary">
              {sourcesRemaining === Infinity ? 'Unlimited' : `${sourcesRemaining} left`}
            </Badge>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <Label className="text-sm font-semibold">Primary website</Label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="rounded-full border border-slate-200 bg-white p-2">
                  <Globe className="h-4 w-4 text-[#5b5ce2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{domainName}</p>
                  <p className="text-xs text-slate-400">Default source for crawling</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-sm font-semibold">Website pages</Label>
              <p className="mb-2 text-xs text-slate-400">Discover and select specific pages to train on</p>
              <TrainingSourcesSelector domainId={domainId} />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Scrape a single URL</Label>
              <p className="mb-2 text-xs text-slate-400">Add content from a specific page</p>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/page"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleScrapeSingle} disabled={!singleUrl || scrapingSelected}>
                  {scrapingSelected ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Scrape
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Text Tab */}
        <TabsContent value="text" className="mt-4 space-y-4">
          <p className="text-sm text-slate-500">Paste or type text directly</p>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <Textarea
              placeholder="Paste your content here... (minimum 50 characters)"
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch id="append-mode-text" checked={appendMode} onCheckedChange={setAppendMode} />
                <Label htmlFor="append-mode-text" className="text-sm">Append to existing content</Label>
              </div>
              <p className="text-xs tabular-nums text-slate-400">
                {uploadText.length} / 50 minimum characters
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleTextUpload} disabled={uploading || uploadText.trim().length < 50} size="lg">
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save text
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* File Upload Tab */}
        <TabsContent value="file" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Upload .txt or .pdf files (scanned PDFs not yet supported)</p>
            <Badge variant="outline" className="text-xs">50MB max</Badge>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Select file</Label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.pdf,text/plain,application/pdf"
                onChange={handleFileChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm">
                  <FileUp className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-slate-900">{selectedFile.name}</span>
                  <span className="tabular-nums text-slate-400">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                </div>
              )}
              {fileError && (
                <p className="mt-2 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{fileError}</p>
              )}
            </div>

            {isSelectedTextFile && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Preview & edit</Label>
                  <Textarea
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="append-mode-file" checked={appendMode} onCheckedChange={setAppendMode} />
                  <Label htmlFor="append-mode-file" className="text-sm">Append to existing content</Label>
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
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload file
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
                <p className="text-xs text-slate-400">
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
                    {uploadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload PDF
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default KnowledgeBaseViewer
