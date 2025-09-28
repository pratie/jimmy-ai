// KIE API Client for file uploads
// Replaces UploadCare functionality

interface KieApiResponse {
  success: boolean
  code: number
  msg: string
  data?: {
    fileName: string
    filePath: string
    downloadUrl: string
    fileSize: number
    mimeType: string
    uploadedAt: string
  }
}

interface UploadResult {
  success: boolean
  data: {
    fileName: string
    filePath: string
    downloadUrl: string
    fileSize: number
    mimeType: string
    uploadedAt: string
  } | null
  error: string | null
}

// KIE API Base URL
const KIE_API_BASE_URL = 'https://kieai.redpandaai.co'

// Get KIE API key from environment
const getKieApiKey = (): string => {
  const apiKey = process.env.KIE_API_KEY || process.env.NEXT_PUBLIC_KIE_API_KEY
  if (!apiKey) {
    throw new Error('KIE_API_KEY is not configured in environment variables')
  }
  return apiKey
}

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = error => reject(error)
  })
}

// Upload file using KIE API Base64 endpoint
export const uploadFile = async (file: File, uploadPath: string = 'images/chatbot'): Promise<UploadResult> => {
  try {
    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return {
        success: false,
        data: null,
        error: 'File size exceeds 2MB limit'
      }
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file)

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const requestBody = {
      base64Data,
      uploadPath,
      fileName
    }

    const response = await fetch(`${KIE_API_BASE_URL}/api/file-base64-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getKieApiKey()}`
      },
      body: JSON.stringify(requestBody)
    })

    const result: KieApiResponse = await response.json()

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        error: null
      }
    } else {
      return {
        success: false,
        data: null,
        error: result.msg || 'Upload failed'
      }
    }
  } catch (error) {
    console.error('KIE API upload failed:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Upload file from URL using KIE API URL endpoint
export const uploadFileFromUrl = async (
  fileUrl: string,
  uploadPath: string = 'images/chatbot',
  fileName?: string
): Promise<UploadResult> => {
  try {
    const requestBody = {
      fileUrl,
      uploadPath,
      ...(fileName && { fileName })
    }

    const response = await fetch(`${KIE_API_BASE_URL}/api/file-url-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getKieApiKey()}`
      },
      body: JSON.stringify(requestBody)
    })

    const result: KieApiResponse = await response.json()

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        error: null
      }
    } else {
      return {
        success: false,
        data: null,
        error: result.msg || 'Upload failed'
      }
    }
  } catch (error) {
    console.error('KIE API URL upload failed:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Get image URL (replaces getUploadCareUrl)
// For KIE API, the downloadUrl is already the full URL
export const getKieImageUrl = (identifier: string): string => {
  if (!identifier) return ''

  // If it's already a full URL, return as is
  if (identifier.startsWith('http')) {
    return identifier
  }

  // If it's a KIE API path, construct the full URL
  if (identifier.includes('tempfile.redpandaai.co')) {
    return `https://${identifier}`
  }

  // For backward compatibility with existing UploadCare URLs
  if (identifier.includes('ucarecdn.com')) {
    return identifier.startsWith('http') ? identifier : `https://${identifier}`
  }

  // Default: assume it's a KIE API file path
  return `https://tempfile.redpandaai.co/${identifier}`
}

// Validate if a KIE API image URL exists (replaces validateUploadCareImage)
export const validateKieImage = async (url: string): Promise<boolean> => {
  try {
    const imageUrl = getKieImageUrl(url)
    const response = await fetch(imageUrl, {
      method: 'HEAD',
    })
    return response.ok
  } catch (error) {
    console.error('Error validating KIE image:', error)
    return false
  }
}

// Check if KIE API is properly configured
export const isKieApiConfigured = (): boolean => {
  return !!(process.env.KIE_API_KEY || process.env.NEXT_PUBLIC_KIE_API_KEY)
}

// For backward compatibility - alias functions to match UploadCare names
export const getUploadCareUrl = getKieImageUrl
export const validateUploadCareImage = validateKieImage
export const isUploadCareConfigured = isKieApiConfigured