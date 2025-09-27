'use client' // is needed only if you're using React Server Components

import { FileUploaderRegular } from '@uploadcare/react-uploader/next'
import '@uploadcare/react-uploader/core.css'
import { useState } from 'react'

export default function TestUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const handleCommonUploadSuccess = (e: any) => {
    console.log('Upload success:', e.detail)

    // Check different possible structures in the event detail
    if (e.detail) {
      console.log('Event detail keys:', Object.keys(e.detail))

      // Try different property names based on documentation
      const files = e.detail.successEntries || e.detail.allEntries || e.detail.files || []

      if (files && files.length > 0) {
        console.log("Uploaded files URL list", files.map((entry: any) => entry.cdnUrl))
        const urls = files.map((entry: any) => entry.cdnUrl).filter(Boolean)
        setUploadedFiles(urls)
      } else {
        console.log('No files found in event detail:', e.detail)
      }
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">UploadCare Test Page (Next.js)</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Configuration:</h2>
        <p>Public Key: <code className="bg-gray-100 px-2 py-1 rounded">48effab0001629bca328</code></p>
        <p>Using: <code className="bg-gray-100 px-2 py-1 rounded">@uploadcare/react-uploader/next</code></p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">File Uploader:</h2>
        <FileUploaderRegular
          sourceList="local, camera, facebook, gdrive"
          classNameUploader="uc-light"
          pubkey="48effab0001629bca328"
          onCommonUploadSuccess={handleCommonUploadSuccess}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Successfully Uploaded Files:</h2>
          {uploadedFiles.map((cdnUrl, index) => (
            <div key={index} className="border p-4 mb-4 rounded">
              <p><strong>CDN URL:</strong> <a href={cdnUrl} target="_blank" className="text-blue-500 underline">{cdnUrl}</a></p>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Test Image Display:</h3>
                <img
                  src={cdnUrl}
                  alt={`Uploaded file ${index + 1}`}
                  className="max-w-xs border rounded"
                  onLoad={() => console.log('✅ Image loaded successfully:', cdnUrl)}
                  onError={() => console.log('❌ Image failed to load:', cdnUrl)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}