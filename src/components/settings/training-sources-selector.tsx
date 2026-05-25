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

  const handleSelectAll = () => {
    if (!urls.length) return
    // Select up to the remaining allowed items
    if (remaining === Infinity) {
      setSelectedUrls(urls.map((u) => u.url))
      return
    }
    const already = new Set(selectedUrls)
    const notSelected = urls.map((u) => u.url).filter((u) => !already.has(u))
    const slots = Math.max(0, (remaining as number) - selectedUrls.length)
    if (slots <= 0) return
    setSelectedUrls([...selectedUrls, ...notSelected.slice(0, slots)])
  }

  const canSelectMore = remaining === Infinity || selectedUrls.length < remaining

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-background hover:bg-accent text-foreground border-border shadow-sm transition-all duration-200"
          onClick={() => {
            if (!urls.length) {
              handleDiscover()
            }
          }}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Select Pages
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden bg-background border border-border shadow-large rounded-2xl">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border bg-background z-20">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">Select Website Pages</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1.5">
              Choose which pages to scrape and train your chatbot on.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between mt-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1">
              {plan} Plan: {remaining === Infinity ? 'Unlimited' : `${remaining} remaining`} of {limit === Infinity ? 'unlimited' : limit} sources
            </Badge>
            {!discovering && urls.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{selectedUrls.length}</span> selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={!canSelectMore || urls.length === 0}
                  className="text-primary hover:text-primary/95 hover:bg-primary/10 h-8"
                >
                  Select All
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-muted/20">
          {discovering ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Discovering URLs from your website...</p>
            </div>
          ) : urls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Link2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">No URLs found yet</p>
                <p className="text-xs text-muted-foreground">Click below to start discovering pages</p>
              </div>
              <Button onClick={handleDiscover} disabled={discovering} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow font-semibold">
                Discover URLs
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px] p-6">
              <div className="grid gap-3 pb-4">
                {urls.map((urlData) => {
                  const isSelected = selectedUrls.includes(urlData.url)
                  const canSelect = canSelectMore || isSelected

                  return (
                    <div
                      key={urlData.url}
                      onClick={() => canSelect && handleToggleUrl(urlData.url)}
                      className={`
                        group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer
                        ${isSelected
                          ? 'bg-primary/5 border-primary/30 shadow-sm'
                          : 'bg-card border-border hover:border-border/80 hover:shadow-soft'
                        }
                        ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className={`
                        mt-1 flex-shrink-0 rounded-full border w-5 h-5 flex items-center justify-center transition-colors
                        ${isSelected
                          ? 'bg-primary border-primary'
                          : 'bg-background border-input group-hover:border-primary/40'
                        }
                      `}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {urlData.title || 'Untitled Page'}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate font-mono bg-muted/40 px-1.5 py-0.5 rounded w-fit max-w-full">
                          {urlData.url}
                        </p>
                        {urlData.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                            {urlData.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-background flex items-center justify-between gap-4 z-20">
          <Button
            variant="ghost"
            onClick={() => setSelectedUrls([])}
            disabled={selectedUrls.length === 0}
            className="text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            Clear Selection
          </Button>
          <div className="flex items-center gap-3">
            {!canSelectMore && (
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-md">
                Limit reached
              </span>
            )}
            <Button
              onClick={handleScrape}
              disabled={selectedUrls.length === 0 || scraping}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow min-w-[140px]"
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
      </DialogContent>
    </Dialog>
  )
}
