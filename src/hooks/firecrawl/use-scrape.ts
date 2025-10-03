'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { onScrapeWebsiteForDomain, onUpdateKnowledgeBase, onTrainChatbot, onUploadTextKnowledgeBase, onGetEmbeddingStatus } from '@/actions/firecrawl'
import { useRouter } from 'next/navigation'

export const useScrapeWebsite = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const onScrape = async (domainId: string) => {
    try {
      setLoading(true)

      toast({
        title: 'Scraping Website',
        description: 'This may take 10-30 seconds...',
      })

      const result = await onScrapeWebsiteForDomain(domainId)

      if (result.status === 200) {
        toast({
          title: 'Success!',
          description: result.message,
        })
        router.refresh() // Reload to show new knowledge base
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to scrape website',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return { onScrape, loading }
}

export const useUpdateKnowledgeBase = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const onUpdate = async (domainId: string, markdown: string) => {
    try {
      setLoading(true)

      const result = await onUpdateKnowledgeBase(domainId, markdown)

      if (result.status === 200) {
        toast({
          title: 'Success',
          description: result.message,
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update knowledge base',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return { onUpdate, loading }
}

export const useTrainChatbot = () => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'not_started' | 'processing' | 'completed' | 'failed'>('not_started')
  const [counts, setCounts] = useState<{ processed: number; total: number }>({ processed: 0, total: 0 })
  const [hasEmbeddings, setHasEmbeddings] = useState(false)
  const [completedAt, setCompletedAt] = useState<Date | null>(null)
  const [kbUpdatedAt, setKbUpdatedAt] = useState<Date | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const onTrain = async (domainId: string, force: boolean = false) => {
    try {
      setLoading(true)
      setProgress(0)
      setStatus('processing')

      toast({
        title: 'Training Started',
        description: 'Generating embeddings for your knowledge base...',
      })

      // Start polling embedding status while training runs server-side
      let stop = false
      const poll = async () => {
        try {
          const res = await onGetEmbeddingStatus(domainId)
          if (res?.status === 200 && res.data) {
            setProgress(res.data.progress)
            const statusValue = res.data.status
            if (statusValue === 'not_started' || statusValue === 'processing' || statusValue === 'completed' || statusValue === 'failed') {
              setStatus(statusValue)
            }
            setCounts({ processed: res.data.processed, total: res.data.total })
            setHasEmbeddings(!!res.data.hasEmbeddings)
            setCompletedAt(res.data.completedAt ? new Date(res.data.completedAt) : null)
            setKbUpdatedAt(res.data.kbUpdatedAt ? new Date(res.data.kbUpdatedAt) : null)
            if (res.data.status === 'completed' || res.data.status === 'failed') {
              stop = true
            }
          }
        } catch (e) {
          // swallow poll errors
        }
        if (!stop) setTimeout(poll, 1000)
      }
      // kick off poll loop
      poll()

      const result = await onTrainChatbot(domainId, force)

      if (result.status === 200) {
        setProgress(100)
        setStatus('completed')
        if (!result.data?.skipped) {
          toast({
            title: 'Training Complete! 🎉',
            description: `${result.data?.chunksProcessed} chunks processed successfully.`,
          })
        } else {
          toast({
            title: 'Up to date',
            description: 'Your chatbot is already trained with the latest content.',
          })
        }
        router.refresh()
      } else {
        toast({
          title: 'Training Failed',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to train chatbot',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return { onTrain, loading, progress, status, counts, hasEmbeddings, completedAt, kbUpdatedAt }
}

export const useUploadText = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const onUpload = async (domainId: string, text: string, append: boolean = true) => {
    try {
      setLoading(true)

      const result = await onUploadTextKnowledgeBase(domainId, text, append)

      if (result.status === 200) {
        toast({
          title: 'Success!',
          description: result.message,
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload text',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return { onUpload, loading }
}
