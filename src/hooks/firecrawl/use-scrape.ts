'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { onScrapeWebsiteForDomain, onUpdateKnowledgeBase, onTrainChatbot, onUploadTextKnowledgeBase } from '@/actions/firecrawl'
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
  const { toast } = useToast()
  const router = useRouter()

  const onTrain = async (domainId: string) => {
    try {
      setLoading(true)
      setProgress(0)

      toast({
        title: 'Training Started',
        description: 'Generating embeddings for your knowledge base...',
      })

      const result = await onTrainChatbot(domainId)

      if (result.status === 200) {
        setProgress(100)
        toast({
          title: 'Training Complete! 🎉',
          description: `${result.data?.chunksProcessed} chunks processed successfully.`,
        })
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

  return { onTrain, loading, progress }
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