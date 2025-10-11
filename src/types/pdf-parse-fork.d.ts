declare module 'pdf-parse-fork' {
  interface PDFInfo {
    Title?: string
    Author?: string
    Subject?: string
    [key: string]: any
  }

  interface PDFData {
    text: string
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: any
    version: string
  }

  function pdf(dataBuffer: Buffer): Promise<PDFData>
  export default pdf
}
