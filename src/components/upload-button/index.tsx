import React, { useState } from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Edit, CheckCircle, X } from 'lucide-react'
import { ErrorMessage } from '@hookform/error-message'
import Image from 'next/image'

type Props = {
  register: UseFormRegister<any>
  errors: FieldErrors<FieldValues>
  label: string
}

const UploadButton = ({ errors, label, register }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    // Reset the input
    const input = document.getElementById('upload-button') as HTMLInputElement
    if (input) input.value = ''
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <Label
            htmlFor="upload-button"
            className="flex gap-2 p-3 rounded-lg bg-cream text-gray-600 cursor-pointer font-semibold text-sm items-center hover:bg-cream/80 transition-colors"
          >
            <Input
              {...register('image', {
                onChange: handleFileChange,
              })}
              className="hidden"
              type="file"
              id="upload-button"
              accept="image/*"
            />
            <Edit size={16} />
            {label}
          </Label>
          {selectedFile && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">File selected</span>
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
