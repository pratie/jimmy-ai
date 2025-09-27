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
  uuid: string,
  transformations?: string
): string => {
  // Use the standard UploadCare CDN format
  const baseUrl = `https://ucarecdn.com/${uuid}/`
  return transformations ? `${baseUrl}-/${transformations}/` : baseUrl
}

// Upload file with error handling
export const uploadFile = async (file: File) => {
  try {
    const result = await uploadClient.uploadFile(file)
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