"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type SetupResponse = {
  success: boolean
  store?: { name?: string }
  upload?: any
  error?: string
}

const ExperimentsPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('chatdock_file_search_store')
  const [storeName, setStoreName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dropError, setDropError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const previewHref = useMemo(() => {
    const params = new URLSearchParams()
    if (storeName) params.set('store', storeName)
    return `/preview/experiments/gemini-file-search?${params.toString()}`
  }, [storeName])

  const onCreateStore = async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/experiments/gemini-file-search/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      const data: SetupResponse = await res.json()
      if (!res.ok || !data.success || !data.store?.name) {
        throw new Error(
          data.error ||
            'Failed to create store. Please ensure @google/genai is updated to a version that supports fileSearchStores.'
        )
      }
      setStoreName(data.store.name)
    } catch (e: any) {
      setCreateError(e?.message || String(e))
    } finally {
      setCreating(false)
    }
  }

  const onSelectFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setDropError(null)
    // allow .txt / .md; ignore others for now
    const accepted = files.filter((f) =>
      f.type === 'text/plain' ||
      f.type === 'text/markdown' ||
      f.name.toLowerCase().endsWith('.txt') ||
      f.name.toLowerCase().endsWith('.md')
    )
    const rejected = files.filter((f) => !accepted.includes(f))
    if (rejected.length) {
      setDropError('Only .txt and .md files are supported in this preview')
    }
    if (accepted.length) {
      setPendingFiles((prev) => [...prev, ...accepted])
    }
  }

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDropError(null)
    const files = Array.from(e.dataTransfer?.files || [])
    if (!files.length) return
    const accepted = files.filter((f) =>
      f.type === 'text/plain' ||
      f.type === 'text/markdown' ||
      f.name.toLowerCase().endsWith('.txt') ||
      f.name.toLowerCase().endsWith('.md')
    )
    const rejected = files.filter((f) => !accepted.includes(f))
    if (rejected.length) {
      setDropError('Only .txt and .md files are supported in this preview')
    }
    if (accepted.length) {
      setPendingFiles((prev) => [...prev, ...accepted])
    }
  }

  const onUploadFiles = async () => {
    if (!storeName || pendingFiles.length === 0) return
    if (!storeName.startsWith('fileSearchStores/')) {
      setUploadError("Invalid store name. Expected format: 'fileSearchStores/xyz'.")
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      for (const f of pendingFiles) {
        // Read as text for now; supports .txt/.md easily
        const text = await f.text()
        const res = await fetch('/api/experiments/gemini-file-search/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeName,
            text,
            filename: f.name,
            mimeType: f.type || (f.name.endsWith('.md') ? 'text/markdown' : 'text/plain'),
          }),
        })
        const data: SetupResponse = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Upload failed: ${f.name}`)
        }
        setUploadedFiles((prev) => [...prev, f.name])
      }
      setPendingFiles([])
    } catch (e: any) {
      setUploadError(e?.message || String(e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Experiments — Gemini File Search</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Create a Gemini File Search store, upload files, then open a live preview grounded on your uploaded documents.
        </p>

        {/* Step 1: Create or connect a store */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-2">1) Create or Connect Store</h2>
          <label className="block text-sm font-medium mb-1">Existing Store Name (optional)</label>
          <input
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="fileSearchStores/xxxx"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">New Store Display Name</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <button
              className="px-4 py-2 rounded bg-black text-white"
              onClick={onCreateStore}
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Create Store'}
            </button>
          </div>
          {createError && <div className="text-red-600 text-sm mt-2">{createError}</div>}
          {storeName && (
            <div className="text-sm mt-2">
              <span className="font-semibold">Active Store:</span> {storeName}
            </div>
          )}
        </div>

        {/* Step 2: Upload files */}
        <div className="border rounded-lg p-4 bg-white mt-4">
          <h2 className="font-semibold mb-2">2) Upload Files</h2>
          <p className="text-xs text-muted-foreground mb-2">Drag & drop .txt/.md here or use the picker (PDF support can be added later).</p>

          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`mb-2 flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 text-sm transition-colors ${
              isDragging ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="mb-2 font-medium">{isDragging ? 'Drop files to upload' : 'Drag & drop files here'}</div>
            <div className="text-xs text-gray-500">Accepted: .txt, .md</div>
          </div>

          {/* Fallback picker */}
          <input
            type="file"
            multiple
            accept=".txt,.md,text/plain,text/markdown"
            onChange={onSelectFiles}
            className="mb-2"
          />
          {pendingFiles.length > 0 && (
            <div className="text-xs mb-2">Selected: {pendingFiles.map((f) => f.name).join(', ')}</div>
          )}
          <button
            onClick={onUploadFiles}
            disabled={!storeName || pendingFiles.length === 0 || uploading}
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:bg-gray-400"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          {dropError && <div className="text-red-600 text-sm mt-2">{dropError}</div>}
          {uploadError && <div className="text-red-600 text-sm mt-2">{uploadError}</div>}
          {uploadedFiles.length > 0 && (
            <div className="text-xs mt-2">Uploaded: {uploadedFiles.join(', ')}</div>
          )}
        </div>

        {/* Step 3: Open live preview */}
        <div className="border rounded-lg p-4 bg-white mt-4">
          <h2 className="font-semibold mb-2">3) Live Preview</h2>
          <p className="text-sm text-muted-foreground mb-2">Opens a separate preview page using the Gemini File Search tool, similar to the existing Live Preview flow.</p>
          <Link href={previewHref} target="_blank" className="inline-block px-4 py-2 rounded bg-emerald-600 text-white">
            Open Live Preview (Experimental)
          </Link>
          {!storeName && (
            <div className="text-xs text-muted-foreground mt-2">Enter or create a store to enable preview.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExperimentsPage
