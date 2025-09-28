import React, { useId, useRef, useState } from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Edit, CheckCircle, X, Upload } from 'lucide-react'
import { ErrorMessage } from '@hookform/error-message'
import Image from 'next/image'
import { uploadFile } from '@/lib/kie-api'

type Props = {
  register: UseFormRegister<any>
  errors: FieldErrors<FieldValues>
  label: string
  onUploadComplete?: (url: string) => void
}

const UploadButton = ({ errors, label, register, onUploadComplete }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const inputRegister = register('image', {
    onChange: handleFileChange,
  })

  // Register a hidden field for the uploaded URL
  const urlRegister = register('imageUrl', {
    value: uploadedUrl || undefined
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const result = await uploadFile(selectedFile, 'images/chatbot')

      if (result.success && result.data) {
        setUploadedUrl(result.data.downloadUrl)
        urlRegister.onChange({ target: { value: result.data.downloadUrl } })
        onUploadComplete?.(result.data.downloadUrl)
      } else {
        console.error('Upload failed:', result.error)
        // You might want to show an error toast here
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadedUrl(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <Label
            htmlFor={inputId}
            className="flex gap-2 p-3 rounded-lg bg-cream text-gray-600 cursor-pointer font-semibold text-sm items-center hover:bg-cream/80 transition-colors"
          >
            <Input
              {...inputRegister}
              ref={(element) => {
                inputRef.current = element
                inputRegister.ref(element)
              }}
              className="hidden"
              type="file"
              id={inputId}
              accept="image/*"
            />
            <Input
              {...urlRegister}
              type="hidden"
              value={uploadedUrl || ''}
            />
            <Edit size={16} />
            {label}
          </Label>
          {selectedFile && !uploadedUrl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
            </div>
          )}
          {uploadedUrl && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Upload successful</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400">
          Recommended size is 300px * 300px, size less than 2MB
        </p>

        {/* Image Preview */}
        {previewUrl && selectedFile && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <ErrorMessage
        errors={errors}
        name="image"
        render={({ message }) => (
          <p className="text-red-400 mt-2">
            {message === 'Required' ? '' : message}
          </p>
        )}
      />
    </>
  )
}

export default UploadButton
