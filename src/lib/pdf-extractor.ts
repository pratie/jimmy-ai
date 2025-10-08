// PDF Text Extraction using pdf-parse-fork
import pdf from 'pdf-parse-fork'

export interface PDFExtractionResult {
  text: string
  pages: number
  metadata?: {
    title?: string
    author?: string
    subject?: string
  }
}

/**
 * Extract text content from PDF buffer
 * @param buffer - PDF file as Buffer
 * @returns Extracted text and metadata
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  try {
    console.log('[PDF Extractor] Processing PDF, size:', buffer.length, 'bytes')

    const data = await pdf(buffer)

    console.log('[PDF Extractor] Extracted', data.numpages, 'pages')
    console.log('[PDF Extractor] Text length:', data.text.length, 'characters')

    return {
      text: data.text,
      pages: data.numpages,
      metadata: data.info ? {
        title: data.info.Title,
        author: data.info.Author,
        subject: data.info.Subject,
      } : undefined
    }
  } catch (error: any) {
    console.error('[PDF Extractor] Error:', error.message)
    throw new Error(`Failed to extract text from PDF: ${error.message}`)
  }
}

/**
 * Validate PDF file
 * @param buffer - File buffer to validate
 * @returns true if valid PDF
 */
export function isValidPDF(buffer: Buffer): boolean {
  // Check PDF magic number (first 4 bytes should be %PDF)
  const header = buffer.toString('utf8', 0, 4)
  return header === '%PDF'
}

/**
 * Clean and normalize extracted PDF text
 * Removes excessive whitespace, fixes line breaks, etc.
 */
export function cleanPDFText(text: string): string {
  return text
    // Remove excessive line breaks (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Remove excessive spaces
    .replace(/ {2,}/g, ' ')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove leading/trailing whitespace
    .trim()
}
