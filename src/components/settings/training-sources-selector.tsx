'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Checkbox } from '../ui/checkbox'
import { ScrollArea } from '../ui/scroll-area'
import { Loader2, Link2, CheckCircle2 } from 'lucide-react'
import { useDiscoverSources, useScrapeSelected } from '@/hooks/firecrawl/use-scrape'
import { Badge } from '../ui/badge'

type Props = {
  domainId: string
}

export const TrainingSourcesSelector = ({ domainId }: Props) => {
  const [open, setOpen] = useState(false)
  const [selectedUrls, setSelectedUrls] = useState<string[]>([])

  const { onDiscover, urls, limit, remaining, plan, loading: discovering } = useDiscoverSources()
  const { onScrapeSelected, loading: scraping } = useScrapeSelected()

  const handleDiscover = async () => {
    const result = await onDiscover(domainId)
    if (result) {
      setSelectedUrls([]) // Reset selection
    }
  }

  const handleToggleUrl = (url: string) => {
    setSelectedUrls(prev => {
      if (prev.includes(url)) {
        return prev.filter(u => u !== url)
      } else {
        // Check if adding would exceed limit
        const maxSelect = remaining === Infinity ? Infinity : remaining
        if (maxSelect !== Infinity && prev.length >= maxSelect) {
          return prev // Don't add if at limit
        }
        return [...prev, url]
      }
    })
  }

  const handleScrape = async () => {
    if (selectedUrls.length === 0) return

    const success = await onScrapeSelected(domainId, selectedUrls)
    if (success) {
      setOpen(false)
      setSelectedUrls([])
    }
  }

  const canSelectMore = remaining === Infinity || selectedUrls.length < remaining

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            if (!urls.length) {
              handleDiscover()
            }
          }}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Select Training Sources
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        {/* Make the content a column layout so we can keep actions visible */}
        <div className="flex flex-col gap-3 max-h-[76vh] min-h-0">
          <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-md">
            <DialogTitle>Select Training Sources</DialogTitle>
            <DialogDescription>
              Choose which pages to scrape and train your chatbot on.
            </DialogDescription>
            <Badge variant="secondary" className="mt-2 w-fit">
              {plan} Plan: {remaining === Infinity ? 'Unlimited' : `${remaining} remaining`} of {limit === Infinity ? 'unlimited' : limit} sources
            </Badge>
          </DialogHeader>

        {discovering && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Discovering URLs from your website...</p>
          </div>
        )}

        {!discovering && urls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-sm text-muted-foreground">Click &ldquo;Discover URLs&rdquo; to find pages on your website</p>
            <Button onClick={handleDiscover} disabled={discovering}>
              Discover URLs
            </Button>
          </div>
        )}

        {!discovering && urls.length > 0 && (
          <>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg sticky top-[70px] z-10">
              <div className="text-sm">
                <span className="font-medium">{selectedUrls.length}</span> of{' '}
                <span className="font-medium">{urls.length}</span> pages selected
              </div>
              {!canSelectMore && (
                <Badge variant="destructive">Limit reached</Badge>
              )}
            </div>

            <ScrollArea className="flex-1 min-h-0 pr-3">
              <div className="space-y-2 pb-16">
                {urls.map((urlData) => {
                  const isSelected = selectedUrls.includes(urlData.url)
                  const canSelect = canSelectMore || isSelected

                  return (
                    <div
                      key={urlData.url}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted'
                      } ${!canSelect ? 'opacity-50' : ''}`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleUrl(urlData.url)}
                        disabled={!canSelect}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                          <p className="text-sm font-medium truncate">{urlData.title || urlData.url}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{urlData.url}</p>
                        {urlData.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{urlData.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Sticky action bar at the bottom, always visible */}
            <div className="sticky bottom-0 z-20 -mx-6 px-6 pb-2">
              <div className="pointer-events-none relative h-4 -mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedUrls([])}
                  disabled={selectedUrls.length === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleScrape}
                  disabled={selectedUrls.length === 0 || scraping}
                >
                  {scraping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    `Scrape ${selectedUrls.length} Source${selectedUrls.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
