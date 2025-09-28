import { UploadClient } from '@uploadcare/upload-client'

// Initialize UploadCare client
export const uploadClient = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

// Validate if an UploadCare image URL exists
export const validateUploadCareImage = async (uuid: string): Promise<boolean> => {
  try {
    const response = await fetch(getUploadCareUrl(uuid), {
      method: 'HEAD', // Use HEAD to avoid downloading the entire image
    })
    return response.ok
  } catch (error) {
    console.error('Error validating UploadCare image:', error)
    return false
  }
}

// Get optimized UploadCare URL with transformations
export const getUploadCareUrl = (
  identifier: string,
  transformations?: string
): string => {
  if (!identifier) return ''

  const isAbsolute = identifier.startsWith('http')
  const cleanedIdentifier = identifier.trim()
  const trimmedIdentifier = cleanedIdentifier.replace(/^\/+|\/+$/g, '')
  const base = isAbsolute
    ? cleanedIdentifier.replace(/\/+$/g, '')
    : `https://ucarecdn.com/${trimmedIdentifier}`
  const normalizedBase = base.endsWith('/') ? base : `${base}/`

  if (!transformations) {
    return normalizedBase
  }

  return `${normalizedBase}-/${transformations}/`
}

// Upload file with error handling
export const uploadFile = async (file: File) => {
  try {
    const result = await uploadClient.uploadFile(file, {
      store: '1',
    })
    return {
      success: true,
      data: result,
      error: null
    }
  } catch (error) {
    console.error('Upload failed:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Check if UploadCare is properly configured
export const isUploadCareConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY
}
