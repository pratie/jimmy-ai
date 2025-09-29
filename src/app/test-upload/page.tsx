'use client'

import { useState, useEffect } from 'react'
import { uploadFile, uploadFileFromUrl, isKieApiConfigured } from '@/lib/kie-api'

export default function TestUploadPage() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    fileName: string
    downloadUrl: string
    fileSize: number
    mimeType: string
  }>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFromUrl, setUploadFromUrl] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const result = await uploadFile(file, 'images/test')

      if (result.success && result.data) {
        setUploadedFiles(prev => [...prev, result.data!])
        console.log('✅ Upload successful:', result.data)
      } else {
        console.error('❌ Upload failed:', result.error)
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Upload error:', error)
      alert('Upload error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!uploadFromUrl.trim()) return

    setIsUploading(true)
    try {
      const result = await uploadFileFromUrl(uploadFromUrl, 'images/test')

      if (result.success && result.data) {
        setUploadedFiles(prev => [...prev, result.data!])
        setUploadFromUrl('')
        console.log('✅ URL upload successful:', result.data)
      } else {
        console.error('❌ URL upload failed:', result.error)
        alert(`URL upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ URL upload error:', error)
      alert('URL upload error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  // Check configuration on client side only
  useEffect(() => {
    setIsConfigured(isKieApiConfigured())
  }, [])

  const clearUploads = () => {
    setUploadedFiles([])
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">KIE API Upload Test</h1>

      {/* Configuration Status */}
      <div className="mb-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">Configuration Status:</h2>
        <p className="text-gray-700">
          KIE API Configured: <span className="font-bold">
            {isConfigured === null ? '⏳ Checking...' : isConfigured ? '✅ Yes' : '❌ No'}
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          API Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">https://kieai.redpandaai.co</code>
        </p>
      </div>

      {/* File Upload Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">File Upload (Base64)</h2>
        <div className="space-y-4">
          <input
            type="file"
            onChange={handleFileUpload}
            accept="image/*"
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 disabled:opacity-50"
          />
          <p className="text-sm text-gray-500">
            Select an image file to upload via KIE API (Base64 method)
          </p>
        </div>
      </div>

      {/* URL Upload Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">URL Upload</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={uploadFromUrl}
              onChange={(e) => setUploadFromUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={isUploading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={handleUrlUpload}
              disabled={isUploading || !uploadFromUrl.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Enter a direct URL to an image to upload via KIE API (URL method)
          </p>
        </div>
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-yellow-800 font-medium">Uploading file...</span>
          </div>
        </div>
      )}

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Uploaded Files ({uploadedFiles.length})
            </h2>
            <button
              onClick={clearUploads}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>

          <div className="grid gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{file.fileName}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Size:</strong> {(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>Type:</strong> {file.mimeType}</p>
                      <p><strong>URL:</strong>
                        <a
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/90 underline ml-1 break-all"
                        >
                          {file.downloadUrl}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    {file.mimeType.startsWith('image/') ? (
                      <img
                        src={file.downloadUrl}
                        alt={file.fileName}
                        className="max-w-full max-h-48 object-contain border rounded"
                        onLoad={() => console.log('✅ Image loaded successfully:', file.downloadUrl)}
                        onError={() => console.log('❌ Image failed to load:', file.downloadUrl)}
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 border rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Non-image file</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Information */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">KIE API Information</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Files are uploaded to temporary storage and auto-deleted after 3 days</li>
          <li>• Base64 method: Converts files to Base64 and uploads via API</li>
          <li>• URL method: Downloads from URL and re-uploads to KIE storage</li>
          <li>• Maximum file size: 2MB (enforced client-side)</li>
          <li>• Authentication: Bearer token via KIE_API_KEY environment variable</li>
        </ul>
      </div>
    </div>
  )
}