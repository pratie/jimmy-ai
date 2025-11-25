import React, { useId, useRef, useState } from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Edit, CheckCircle, X, Upload } from 'lucide-react'
import { ErrorMessage } from '@hookform/error-message'
import Image from 'next/image'
import { uploadFile } from '@/lib/kie-api'
import { Button } from '../ui/button'

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
      <div className="flex flex-col gap-4">
        <Label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center h-32 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-gray-500 transition-colors" />
            <p className="mb-2 text-sm text-gray-500 font-semibold">
              <span className="font-bold">Click to upload (Optional)</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 2MB)</p>
          </div>
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
        </Label>

        {selectedFile && !uploadedUrl && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Selected File
              </>
            )}
          </Button>
        )}

        {uploadedUrl && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-100">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Icon uploaded successfully</span>
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && selectedFile && !uploadedUrl && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
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
