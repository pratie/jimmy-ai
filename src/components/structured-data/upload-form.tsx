'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function UploadDataForm({ domainId }: { domainId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const onUpload = async () => {
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('domainId', domainId)

        try {
            const res = await fetch('/api/upload-structured-data', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Upload failed')
            }

            toast.success('Data uploaded successfully')
            setFile(null)
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Upload failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-white dark:bg-gray-900">
            <h3 className="font-semibold text-lg">Upload Structured Data</h3>
            <div className="flex gap-4 items-center">
                <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={loading}
                />
                <Button onClick={onUpload} disabled={!file || loading} type="button">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload
                </Button>
            </div>
            <p className="text-sm text-gray-500">Supported formats: CSV, Excel</p>
        </div>
    )
}
