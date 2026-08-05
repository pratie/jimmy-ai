/**
 * Provisions ChatDock's own assistant for www.chatdock.io.
 *
 *   node --env-file=.env.local scripts/provision-self-widget.mjs
 *
 * Idempotent: re-running updates the existing tenant and re-ingests content
 * rather than creating a second one.
 *
 * Deliberately NOT part of prisma/seed.mjs. The seed deletes and recreates its
 * organization on every run, so a key issued there would die the next time
 * anyone seeded — and this key goes in a production environment variable.
 *
 * Uses REAL OpenAI embeddings, not the seed's deterministic pseudo-vectors.
 * A widget on our own marketing site that cannot retrieve its own content would
 * answer from the model's priors and invent pricing — the exact failure the
 * homepage claims the product avoids.
 *
 * Talks to Firecrawl and OpenAI over plain HTTP rather than importing the app's
 * lib modules, which are `server-only` and use `@/` path aliases that a
 * standalone node script cannot resolve.
 */

import { PrismaClient } from '@prisma/client'
import { randomBytes, createHash } from 'node:crypto'

const prisma = new PrismaClient()

const SITE = 'https://www.chatdock.io'
const CANONICAL = 'chatdock.io'
const ORG_SLUG = 'chatdock-internal'

/** Pages worth grounding on. Kept small — this is a marketing site, not a corpus. */
const PAGES = [
  'https://www.chatdock.io',
  'https://www.chatdock.io/blogs',
]

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY

/* ── Providers ──────────────────────────────────────────────────────────── */

async function scrape(url) {
  if (!FIRECRAWL_KEY) throw new Error('FIRECRAWL_API_KEY is not set')
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FIRECRAWL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, onlyMainContent: true, formats: ['markdown'] }),
  })
  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const json = await res.json()
  return {
    markdown: json?.data?.markdown ?? '',
    title: json?.data?.metadata?.title ?? url,
  }
}

async function embed(texts) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY is not set')
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: texts }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const json = await res.json()
  return json.data.map((d) => d.embedding)
}

/** ~700-char chunks on sentence boundaries. Matches the app's ingest shape. */
function chunk(text) {
  const clean = text.replace(/\n{3,}/g, '\n\n').trim()
  const parts = clean.split(/(?<=[.!?])\s+|\n\n/)
  const out = []
  let buf = ''
  for (const part of parts) {
    if ((buf + ' ' + part).length > 700 && buf) {
      out.push(buf.trim())
      buf = part
    } else {
      buf = buf ? `${buf} ${part}` : part
    }
  }
  if (buf.trim()) out.push(buf.trim())
  return out.filter((c) => c.length > 60)
}

/* ── Provision ──────────────────────────────────────────────────────────── */

async function main() {
  console.log('→ Organization…')
  const plan = await prisma.plan.findUnique({ where: { code: 'BUSINESS' }, select: { id: true } })

  const org = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    create: {
      name: 'ChatDock',
      slug: ORG_SLUG,
      // `internal` keeps our own tenant out of any future customer analytics.
      organizationType: 'internal',
      primaryColor: '#5B5CE2',
      // Our own site: a "Powered by ChatDock" badge on chatdock.io is noise.
      hideChatDockBranding: true,
      onboardingStatus: 'completed',
      status: 'active',
    },
    update: { status: 'active', hideChatDockBranding: true },
  })

  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    create: {
      organizationId: org.id,
      planId: plan?.id ?? null,
      provider: 'internal',
      status: 'active',
      billingInterval: 'monthly',
    },
    update: { planId: plan?.id ?? null, status: 'active' },
  })

  console.log('→ Workspace + website…')
  let workspace = await prisma.clientWorkspace.findFirst({
    where: { organizationId: org.id, slug: 'chatdock' },
    select: { id: true },
  })
  workspace ??= await prisma.clientWorkspace.create({
    data: {
      organizationId: org.id,
      name: 'ChatDock',
      slug: 'chatdock',
      businessName: 'ChatDock',
      workspaceType: 'direct_business',
      industry: 'saas',
      websiteUrl: SITE,
      primaryColor: '#5B5CE2',
      status: 'active',
    },
    select: { id: true },
  })

  const allowedDomains = [CANONICAL, `www.${CANONICAL}`]

  let website = await prisma.website.findFirst({
    where: { clientWorkspaceId: workspace.id, canonicalDomain: CANONICAL },
    select: { id: true },
  })
  website ??= await prisma.website.create({
    data: {
      clientWorkspaceId: workspace.id,
      name: 'Marketing site',
      url: SITE,
      canonicalDomain: CANONICAL,
      isPrimary: true,
      allowedWidgetDomains: allowedDomains,
    },
    select: { id: true },
  })

  console.log('→ Assistant…')
  let assistant = await prisma.assistant.findFirst({
    where: { clientWorkspaceId: workspace.id, slug: 'chatdock-assistant' },
    select: { id: true },
  })
  const assistantData = {
    name: 'ChatDock',
    welcomeMessage:
      "Hi! I can answer questions about ChatDock — what it does, pricing, and how agencies use it. What would you like to know?",
    fallbackMessage:
      "I can't confirm that from what I have on file. Book a 15-minute walkthrough and Prathap will answer directly: https://cal.com/prathap-reddy-caxwn4/15min",
    mode: 'sales',
    brandTone: 'direct, concrete, no hype',
    status: 'published',
    publishedAt: new Date(),
    citationsEnabled: true,
    leadCaptureEnabled: true,
    // No calendar integration on our own site — booking goes to cal.com, so
    // promising in-chat scheduling would be a claim we cannot honour.
    bookingEnabled: false,
    humanHandoffEnabled: false,
  }
  assistant = assistant
    ? await prisma.assistant.update({ where: { id: assistant.id }, data: assistantData, select: { id: true } })
    : await prisma.assistant.create({
        data: { ...assistantData, clientWorkspaceId: workspace.id, slug: 'chatdock-assistant' },
        select: { id: true },
      })

  console.log('→ Knowledge…')
  let source = await prisma.knowledgeSource.findFirst({
    where: { clientWorkspaceId: workspace.id, sourceType: 'website' },
    select: { id: true },
  })
  source ??= await prisma.knowledgeSource.create({
    data: {
      clientWorkspaceId: workspace.id,
      sourceType: 'website',
      name: CANONICAL,
      originalUrl: SITE,
      status: 'active',
      syncStatus: 'syncing',
    },
    select: { id: true },
  })

  await prisma.assistantKnowledgeSource.upsert({
    where: { assistantId_knowledgeSourceId: { assistantId: assistant.id, knowledgeSourceId: source.id } },
    create: { assistantId: assistant.id, knowledgeSourceId: source.id, enabled: true },
    update: { enabled: true },
  })

  let totalChunks = 0
  for (const url of PAGES) {
    try {
      const { markdown, title } = await scrape(url)
      if (!markdown || markdown.length < 200) {
        console.log(`  ! skipped ${url} (too little content)`)
        continue
      }

      const doc = await prisma.knowledgeDocument.upsert({
        where: { knowledgeSourceId_canonicalUrl: { knowledgeSourceId: source.id, canonicalUrl: url } },
        create: {
          knowledgeSourceId: source.id,
          clientWorkspaceId: workspace.id,
          canonicalUrl: url,
          title,
          language: 'en',
          contentHash: createHash('sha256').update(markdown).digest('hex'),
          extractedText: markdown,
          status: 'active',
          lastCrawledAt: new Date(),
        },
        update: {
          title,
          contentHash: createHash('sha256').update(markdown).digest('hex'),
          extractedText: markdown,
          lastCrawledAt: new Date(),
        },
        select: { id: true },
      })

      // Replace this document's chunks rather than appending, so a re-run does
      // not leave two copies of the same page in the index.
      await prisma.knowledgeChunk.deleteMany({ where: { knowledgeDocumentId: doc.id } })

      const chunks = chunk(markdown)
      const vectors = await embed(chunks)

      for (const [i, text] of chunks.entries()) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "KnowledgeChunk"
             ("knowledgeDocumentId","clientWorkspaceId","chunkIndex","content",
              "tokenCount","contentHash","embeddingProvider","embeddingModel",
              "embeddingVersion","embedding","updatedAt")
           VALUES ($1::uuid,$2::uuid,$3,$4,$5,$6,'openai','text-embedding-3-small',1,$7::vector,NOW())`,
          doc.id, workspace.id, i, text,
          Math.ceil(text.length / 4),
          createHash('sha256').update(text).digest('hex'),
          `[${vectors[i].join(',')}]`
        )
      }
      totalChunks += chunks.length
      console.log(`  ✓ ${url} → ${chunks.length} chunks`)
    } catch (error) {
      console.log(`  ! ${url} failed: ${error.message}`)
    }
  }

  await prisma.knowledgeSource.update({
    where: { id: source.id },
    data: { syncStatus: totalChunks > 0 ? 'synced' : 'failed', lastSyncedAt: new Date() },
  })

  console.log('→ Deployment…')
  let deployment = await prisma.assistantDeployment.findFirst({
    where: { assistantId: assistant.id, deploymentType: 'website_widget' },
    select: { id: true, publicKey: true },
  })
  deployment = deployment
    ? await prisma.assistantDeployment.update({
        where: { id: deployment.id },
        data: { status: 'active', allowedDomains, websiteId: website.id },
        select: { id: true, publicKey: true },
      })
    : await prisma.assistantDeployment.create({
        data: {
          assistantId: assistant.id,
          websiteId: website.id,
          deploymentType: 'website_widget',
          publicKey: randomBytes(24).toString('base64url'),
          status: 'active',
          allowedDomains,
        },
        select: { id: true, publicKey: true },
      })

  console.log(`\n${totalChunks} chunks indexed with real OpenAI embeddings.`)
  console.log(`\nNEXT_PUBLIC_CHATDOCK_WIDGET_KEY=${deployment.publicKey}\n`)
}

main()
  .catch((e) => { console.error('✖', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
