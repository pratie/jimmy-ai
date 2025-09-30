import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import KnowledgeBaseViewer from '@/components/settings/knowledge-base-viewer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: { domainId: string }
}

const DomainPage = async ({ params }: Props) => {
  // Extract domain name from ID (e.g., "example" from URL)
  const domainName = params.domainId

  const domain = await onGetCurrentDomainInfo(domainName)

  if (!domain || !domain.domains.length) {
    redirect('/dashboard')
  }

  const activeDomain = domain.domains[0]

  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Domain Header */}
          <div>
            <h1 className="text-3xl font-bold">{activeDomain.name}</h1>
            <p className="text-muted-foreground">
              Manage your chatbot's knowledge base and training data
            </p>
          </div>

          <Separator />

          {/* Knowledge Base Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Knowledge Base</h2>
            <KnowledgeBaseViewer
              domainId={activeDomain.id}
              domainName={activeDomain.name}
              knowledgeBase={activeDomain.chatBot?.knowledgeBase || null}
              status={activeDomain.chatBot?.knowledgeBaseStatus || null}
              updatedAt={activeDomain.chatBot?.knowledgeBaseUpdatedAt || null}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {activeDomain.chatBot?.knowledgeBaseStatus || 'Not Set'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Content Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeDomain.chatBot?.knowledgeBase
                    ? `${(activeDomain.chatBot.knowledgeBase.length / 1000).toFixed(1)}k`
                    : '0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">characters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeDomain.chatBot?.knowledgeBaseUpdatedAt
                    ? new Date(activeDomain.chatBot.knowledgeBaseUpdatedAt).toLocaleDateString()
                    : 'Never'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default DomainPage