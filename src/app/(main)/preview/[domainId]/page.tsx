import ChatbotPreview from '@/components/settings/chatbot-preview'
import { client } from '@/lib/prisma'
import { AuthorizationError } from '@/lib/permissions'
import { requireWorkspace } from '@/lib/tenant'
import { ArrowLeft, ShieldCheck, Wrench } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'

/**
 * The agency's private test workspace for one client.
 *
 * The route parameter is a `ClientWorkspace` id, which is *not* a credential —
 * it appears in dashboard URLs all day. So the page authenticates the caller
 * and checks they may read that workspace before it looks anything up, and the
 * only thing it hands to the browser is the assistant's `preview` deployment
 * `publicKey`. That is what `resolveWidgetRequest` accepts; passing the raw
 * workspace id (as this page used to) resolved to nothing and every preview
 * died on "Configuration error. Please contact support."
 *
 * A `preview` deployment, not the website widget's key, for the two reasons in
 * `resolveWidgetRequest`: the origin allow-list is enforced only for
 * `website_widget` and the dashboard's origin is the agency's, and a preview
 * deployment is allowed to serve a *draft* assistant — which is the entire
 * point of testing before install.
 */

export const metadata: Metadata = {
  title: 'Agent preview — ChatDock',
  robots: { index: false, follow: false },
}

function NotDeployed({ workspaceId, name }: { workspaceId: string; name: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,.06)]">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500">
        <Wrench className="h-5 w-5" />
      </span>
      <h2 className="mt-5 text-base font-semibold text-slate-900">
        {name} has no assistant to test yet
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Nothing is broken — this client just doesn&apos;t have an assistant set up. Create one in
        settings, give it a knowledge source, and this page will show the visitor experience.
      </p>
      <Link
        href={`/settings/${workspaceId}`}
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-slate-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
      >
        Go to settings
      </Link>
    </div>
  )
}

export default async function PreviewPage({ params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params
  // Shape-checked before it reaches Prisma: the column is a uuid, and a
  // non-uuid path segment raises a driver error rather than "not found".
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!domainId || typeof domainId !== 'string' || !UUID.test(domainId)) redirect('/dashboard')

  // Verified ids only. `requireWorkspace` throws on a signed-out caller, a
  // workspace in someone else's organization, and a workspace this member has
  // no access to — all three land on the dashboard rather than confirming
  // whether the id exists.
  let clientWorkspaceId: string
  let userId: string
  try {
    const { ctx, access } = await requireWorkspace(domainId, 'viewClientWorkspace')
    clientWorkspaceId = access.clientWorkspaceId
    userId = ctx.userId
  } catch (error) {
    if (error instanceof AuthorizationError) redirect('/dashboard')
    throw error
  }

  const workspace = await client.clientWorkspace.findFirst({
    where: { id: clientWorkspaceId, deletedAt: null },
    select: { id: true, name: true },
  })
  if (!workspace) redirect('/dashboard')

  const previewKey = await getOrCreatePreviewKey(clientWorkspaceId, userId)

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"><ArrowLeft className="h-3.5 w-3.5" /> Back to workspace</Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Test {workspace.name}</h1>
            <p className="mt-2 text-sm text-slate-500">Review the visitor experience before sharing install code with your client.</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:self-auto"><ShieldCheck className="h-4 w-4" /> Private preview · not indexed</div>
        </div>
        {previewKey ? (
          <ChatbotPreview publicKey={previewKey} />
        ) : (
          <NotDeployed workspaceId={workspace.id} name={workspace.name} />
        )}
      </div>
    </main>
  )
}

/**
 * The workspace's preview key, minted on first use.
 *
 * Mirrors `onGetPreviewKey` in `actions/settings`, which the Test & customise
 * panel calls. Creating on demand is what makes the two agree: an agency that
 * opens this page before ever opening that panel gets a working preview instead
 * of an empty state that is really just a missing row.
 *
 * Returns null only when the workspace genuinely has no assistant.
 */
async function getOrCreatePreviewKey(
  clientWorkspaceId: string,
  userId: string
): Promise<string | null> {
  const assistant = await client.assistant.findFirst({
    where: { clientWorkspaceId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  if (!assistant) return null

  const existing = await client.assistantDeployment.findFirst({
    where: { assistantId: assistant.id, deploymentType: 'preview', status: 'active' },
    select: { publicKey: true },
  })
  if (existing) return existing.publicKey

  const created = await client.assistantDeployment.create({
    data: {
      assistantId: assistant.id,
      deploymentType: 'preview',
      publicKey: randomBytes(24).toString('base64url'),
      status: 'active',
      // Empty on purpose: the allow-list is not applied to this deployment type.
      allowedDomains: [],
      createdByUserId: userId,
    },
    select: { publicKey: true },
  })
  return created.publicKey
}
