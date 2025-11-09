"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

type SetupResponse = {
  success: boolean
  store?: { name?: string }
  upload?: any
  error?: string
}

const ExperimentsPage: React.FC = () => {
  // Simple flow state
  const [storeName, setStoreName] = useState('')
  const [displayName] = useState('chatdock_file_search_store')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<string>('')
  const [totalFiles, setTotalFiles] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Advanced (optional) connect existing store
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [manualStoreInput, setManualStoreInput] = useState('')

  const previewHref = useMemo(() => {
    const params = new URLSearchParams()
    if (storeName) params.set('store', storeName)
    return `/preview/experiments/gemini-file-search?${params.toString()}`
  }, [storeName])

  // Ensures a store exists; creates one when missing
  const ensureStore = async () => {
    if (storeName) return storeName
    const res = await fetch('/api/experiments/gemini-file-search/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    })
    const data: SetupResponse = await res.json()
    if (!res.ok || !data.success || !data.store?.name) {
      throw new Error(
        data.error || 'Failed to create store. Please check server Gemini API key.'
      )
    }
    setStoreName(data.store.name)
    return data.store.name
  }

  const MAX_FILE_BYTES = 40 * 1024 * 1024 // 40 MB
  // Accept .txt/.md/.pdf with size guard
  const acceptFiles = (files: File[]) => {
    const accepted = files.filter(
      (f) =>
        f.type === 'text/plain' ||
        f.type === 'text/markdown' ||
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.txt') ||
        f.name.toLowerCase().endsWith('.md') ||
        f.name.toLowerCase().endsWith('.pdf')
    )
    const unsupported = files.filter((f) => !accepted.includes(f))
    const tooLarge = accepted.filter((f) => f.size > MAX_FILE_BYTES)
    const finalAccepted = accepted.filter((f) => f.size <= MAX_FILE_BYTES)

    const messages: string[] = []
    if (unsupported.length) messages.push('Only .pdf, .txt and .md files are supported')
    if (tooLarge.length) messages.push(`Max size is 40MB per file: ${tooLarge.map(f=>f.name).join(', ')}`)
    if (messages.length) setError(messages.join(' · '))
    if (finalAccepted.length) setPendingFiles((prev) => [...prev, ...finalAccepted])
  }

  const onSelectFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setError(null)
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    acceptFiles(files)
  }

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true)
  }
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
  }
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false); setError(null)
    const files = Array.from(e.dataTransfer?.files || [])
    if (!files.length) return
    acceptFiles(files)
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = (err) => reject(err)
    })

  const uploadAll = async () => {
    if (pendingFiles.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const name = await ensureStore()
      if (!name || !name.startsWith('fileSearchStores/')) {
        throw new Error("Invalid store name returned by server")
      }
      setTotalFiles(pendingFiles.length)
      setUploadedCount(0)
      setProgress(0)
      for (let i = 0; i < pendingFiles.length; i++) {
        const f = pendingFiles[i]
        setCurrentFile(f.name)
        const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        const payload = isPdf
          ? {
              storeName: name,
              fileBase64: await fileToBase64(f),
              filename: f.name,
              mimeType: f.type || 'application/pdf',
            }
          : {
              storeName: name,
              text: await f.text(),
              filename: f.name,
              mimeType: f.type || (f.name.toLowerCase().endsWith('.md') ? 'text/markdown' : 'text/plain'),
            }

        const res = await fetch('/api/experiments/gemini-file-search/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data: SetupResponse = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Upload failed: ${f.name}`)
        }
        setUploadedFiles((prev) => [...prev, f.name])
        const done = i + 1
        setUploadedCount(done)
        setProgress(Math.round((done / pendingFiles.length) * 100))
      }
      setPendingFiles([])
      // Auto-open preview for a smooth user journey
      if (typeof window !== 'undefined' && name) {
        const url = `/preview/experiments/gemini-file-search?store=${encodeURIComponent(name)}`
        try { window.open(url, '_blank', 'noopener,noreferrer') } catch (_) {}
      }
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setBusy(false)
      setCurrentFile('')
    }
  }

  const connectManualStore = () => {
    if (!manualStoreInput) return
    if (!manualStoreInput.startsWith('fileSearchStores/')) {
      setError("Invalid store id. Expected 'fileSearchStores/…'")
      return
    }
    setStoreName(manualStoreInput)
    setError(null)
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Chat With Your Documents - Gemini AI file search</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Powered by Gemini File Search. Upload a PDF, .txt or .md file and we’ll create a store automatically. Then open Live Preview to chat.
        </p>

        {/* Primary simple flow */}
        <div className="border rounded-lg p-4 bg-white">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`mb-3 flex flex-col items-center justify-center border-2 border-dashed rounded-md p-10 text-sm transition-colors ${
              isDragging ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="text-lg font-semibold mb-2">
              {isDragging ? 'Drop files to upload' : 'Drag & drop your PDF, .txt or .md files here'}
            </div>
            <div className="text-xs text-gray-500">We create a store automatically on first upload</div>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
              onChange={onSelectFiles}
            />
            <button
              onClick={uploadAll}
              disabled={pendingFiles.length === 0 || busy}
              className="px-4 py-2 rounded bg-indigo-600 text-white disabled:bg-gray-400"
            >
              {busy ? 'Uploading…' : 'Upload & Prepare Preview'}
            </button>
          </div>

          {pendingFiles.length > 0 && (
            <div className="text-xs mt-2">Selected: {pendingFiles.map((f) => f.name).join(', ')}</div>
          )}
          {(busy || uploadedCount > 0) && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{uploadedCount}/{totalFiles} uploaded {currentFile && `· ${currentFile}`}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          {uploadedFiles.length > 0 && (
            <div className="text-xs mt-2">Uploaded: {uploadedFiles.join(', ')}</div>
          )}
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>

        {/* Live preview */}
        <div className="border rounded-lg p-4 bg-white mt-4">
          <h2 className="font-semibold mb-2">Live Preview</h2>
          <p className="text-sm text-muted-foreground mb-2">Open a new tab to chat over your uploaded files.</p>
          <Link
            href={previewHref}
            target="_blank"
            className={`inline-block px-4 py-2 rounded ${storeName ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600 pointer-events-none'}`}
          >
            Open Live Preview
          </Link>
          {!storeName && (
            <div className="text-xs text-muted-foreground mt-2">Upload at least one file to enable preview.</div>
          )}
        </div>

        {/* Advanced controls */}
        <div className="border rounded-lg p-4 bg-white mt-4">
          <button
            className="text-sm font-semibold underline"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Advanced: Connect Existing Store'}
          </button>
          {showAdvanced && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm font-medium">Existing Store Name</label>
              <input
                className="w-full border rounded px-2 py-1"
                placeholder="fileSearchStores/xxxx"
                value={manualStoreInput}
                onChange={(e) => setManualStoreInput(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={connectManualStore}
                  className="px-3 py-2 rounded bg-black text-white"
                >
                  Use This Store
                </button>
                {storeName && (
                  <div className="text-xs self-center">Active: {storeName}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExperimentsPage
