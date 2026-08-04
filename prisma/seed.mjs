/**
 * DEVELOPMENT SEED DATA — clearly marked, never automatic.
 *
 *   ALLOW_SEED=1 npm run db:seed
 *
 * Refuses to run without ALLOW_SEED=1. Every record it creates is tagged:
 *   - organization/workspace names prefixed "[DEV]"
 *   - settings.isSeedData = true on every tenant root
 *   - user emails on the reserved @seed.invalid domain (RFC 2606), so a seed
 *     address can never reach a real inbox
 *
 * Re-running wipes only the seeded organization and rebuilds it. Real data is
 * matched by nothing here and is never touched.
 *
 * Embeddings are deterministic pseudo-vectors derived from the chunk text, not
 * OpenAI calls. That keeps seeding free and reproducible, and it is sufficient
 * for what the seed is for — exercising tenant SCOPING of retrieval, which is
 * the security-critical property. Semantic quality is not being tested here.
 *
 * ⚠ CONSEQUENCE: seeded chunks live in a different vector space from real
 * queries, which are embedded with OpenAI. So a live chat against seeded data
 * retrieves ZERO chunks and the assistant answers ungrounded — it will invent
 * plausible hours and prices. That is expected, and it is a neat demonstration
 * of why grounding matters. To exercise real retrieval, ingest a real website
 * through the knowledge UI instead of relying on this seed.
 */

import { PrismaClient } from '@prisma/client'
import { createHash, randomBytes } from 'node:crypto'

const prisma = new PrismaClient()

if (process.env.ALLOW_SEED !== '1') {
  console.error(
    '✖ Refusing to seed.\n' +
      '  This writes demo data. Set ALLOW_SEED=1 to confirm you mean it:\n' +
      '    ALLOW_SEED=1 npm run db:seed\n'
  )
  process.exit(1)
}

const SEED_ORG_SLUG = 'dev-northbeam'
const SEED_TAG = { isSeedData: true, seededAt: new Date().toISOString() }

/* ── Deterministic helpers ─────────────────────────────────────────────── */

/** Stable 1536-d unit vector from a string. No API call, reproducible. */
function pseudoEmbedding(text) {
  const dims = 1536
  const out = new Array(dims)
  let seed = createHash('sha256').update(text).digest()
  let sumSq = 0
  for (let i = 0; i < dims; i++) {
    if (i % 32 === 0) seed = createHash('sha256').update(seed).digest()
    const v = (seed[i % 32] - 127.5) / 127.5
    out[i] = v
    sumSq += v * v
  }
  const norm = Math.sqrt(sumSq) || 1
  return out.map((v) => v / norm)
}

const token = () => randomBytes(24).toString('base64url')
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000)
const chunkText = (s) =>
  s.split(/(?<=\.)\s+/).reduce((acc, sentence) => {
    const last = acc[acc.length - 1]
    if (last && (last + ' ' + sentence).length < 320) acc[acc.length - 1] = last + ' ' + sentence
    else acc.push(sentence)
    return acc
  }, [])

/* ── Fixtures ──────────────────────────────────────────────────────────── */

const CLIENTS = [
  {
    slug: 'bright-smile-dental',
    name: '[DEV] Bright Smile Dental',
    businessName: 'Bright Smile Dental',
    industry: 'dental',
    domain: 'brightsmiledental.example',
    color: '#5B5CE2',
    pages: [
      ['/services', 'Services', 'In-office teeth whitening is $199 and takes about 45 minutes. Routine cleanings are $120 for returning patients and $89 for new patients. Implant consultations are free.'],
      ['/hours-location', 'Hours & Location', 'We are open Monday to Friday 8:00 AM to 6:00 PM and Saturday 9:00 AM to 2:00 PM. We are closed Sundays. Parking is free behind the building.'],
      ['/new-patients', 'New Patients', 'Walk-ins are welcome Monday to Friday before 4:00 PM. Same-day emergency slots are held open each morning. Please bring your insurance card to the first visit.'],
    ],
    qualifiers: [
      ['new_patient', 'Are you a new patient?', 'boolean'],
      ['treatment', 'Which treatment?', 'single_select'],
      ['best_number', 'Best number to reach you', 'phone'],
    ],
    question: 'Do you offer teeth whitening on Saturdays?',
    answer: 'Yes — in-office whitening is $199 and takes about 45 minutes. Saturday hours are 9:00 AM to 2:00 PM.',
  },
  {
    slug: 'cardinal-heating',
    name: '[DEV] Cardinal Heating & Air',
    businessName: 'Cardinal Heating & Air',
    industry: 'hvac',
    domain: 'cardinalheating.example',
    color: '#16A67A',
    pages: [
      ['/services', 'Services', 'We service and install air conditioning, furnaces and heat pumps. Diagnostic call-outs are $89, waived if you proceed with the repair.'],
      ['/service-area', 'Service Area', 'We cover the metro area and the two neighbouring counties. Same-day emergency slots are held daily for total system failures.'],
    ],
    qualifiers: [
      ['postcode', 'Postcode', 'text'],
      ['system_down', 'Is the unit completely down?', 'boolean'],
      ['best_number', 'Phone number', 'phone'],
    ],
    question: 'My AC stopped cooling. Can someone come today?',
    answer: 'We do hold same-day emergency slots. Tell me your postcode and whether the unit is running at all, and I will get you into the dispatch queue.',
  },
  {
    slug: 'vance-reed-law',
    name: '[DEV] Vance & Reed Law',
    businessName: 'Vance & Reed Law',
    industry: 'legal',
    domain: 'vancereedlaw.example',
    color: '#0E1726',
    pages: [
      ['/practice-areas', 'Practice Areas', 'We handle motor-vehicle claims, personal injury and workplace injury matters. We do not take criminal defence work.'],
      ['/consultations', 'Consultations', 'Consultations for motor-vehicle claims are free and usually scheduled within 48 hours. Our intake team collects the details before the attorney call.'],
    ],
    qualifiers: [
      ['matter_type', 'Type of matter', 'single_select'],
      ['incident_date', 'When did it happen?', 'date'],
      ['best_number', 'Best number to reach you', 'phone'],
    ],
    question: 'I was rear-ended last week. Do I have a case?',
    answer: 'I cannot assess a case — an attorney has to do that. Consultations for motor-vehicle claims are free and usually happen within 48 hours. If you leave your name and number, the intake team will call you.',
  },
]

/* ── Seed ──────────────────────────────────────────────────────────────── */

async function main() {
  console.log('→ Clearing any previous seed organization…')
  const existing = await prisma.organization.findUnique({
    where: { slug: SEED_ORG_SLUG },
    select: { id: true },
  })
  if (existing) {
    // Cascades tear down workspaces and everything beneath them.
    await prisma.organization.delete({ where: { id: existing.id } })
  }
  await prisma.user.deleteMany({ where: { email: { endsWith: '@seed.invalid' } } })

  const proPlan = await prisma.plan.findUnique({ where: { code: 'PRO' } })
  if (!proPlan) {
    console.error('✖ No PRO plan. Run `npm run db:seed-plans` first.')
    process.exit(1)
  }

  console.log('→ Organization + team…')
  const org = await prisma.organization.create({
    data: {
      name: '[DEV] Northbeam Digital',
      slug: SEED_ORG_SLUG,
      organizationType: 'agency',
      primaryColor: '#5B5CE2',
      hideChatDockBranding: true, // PRO entitlement
      onboardingStatus: 'completed',
      settings: SEED_TAG,
    },
  })

  const people = [
    ['ava.owner@seed.invalid', 'Ava Nordstrom', 'owner'],
    ['ben.manager@seed.invalid', 'Ben Okafor', 'manager'],
    ['cleo.member@seed.invalid', 'Cleo Marchetti', 'member'],
    ['dana.analyst@seed.invalid', 'Dana Whitfield', 'analyst'],
  ]
  const users = {}
  for (const [email, fullName, role] of people) {
    const user = await prisma.user.create({
      data: {
        clerkId: `seed_${email.split('@')[0]}`,
        email,
        fullName,
        status: 'active',
        lastLoginAt: daysAgo(1),
      },
    })
    await prisma.organizationMembership.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role,
        status: 'active',
        acceptedAt: daysAgo(30),
      },
    })
    users[role] = user
  }

  // The client-side user — belongs to no organization, only to one workspace.
  const clientUser = await prisma.user.create({
    data: {
      clerkId: 'seed_client_admin',
      email: 'reception@seed.invalid',
      fullName: 'Priya Raman',
      status: 'active',
    },
  })

  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      planId: proPlan.id,
      provider: 'dodo',
      status: 'active',
      billingInterval: 'monthly',
      currentPeriodStart: daysAgo(12),
      currentPeriodEnd: new Date(Date.now() + 18 * 86_400_000),
    },
  })

  let totals = { workspaces: 0, assistants: 0, chunks: 0, conversations: 0, leads: 0, bookings: 0, usage: 0 }

  for (const [i, spec] of CLIENTS.entries()) {
    console.log(`→ Client workspace: ${spec.businessName}…`)

    const ws = await prisma.clientWorkspace.create({
      data: {
        organizationId: org.id,
        name: spec.name,
        slug: spec.slug,
        businessName: spec.businessName,
        workspaceType: 'active_client',
        industry: spec.industry,
        websiteUrl: `https://${spec.domain}`,
        primaryColor: spec.color,
        contactEmail: `hello@${spec.domain}`,
        status: 'active',
        createdByUserId: users.owner.id,
        settings: SEED_TAG,
      },
    })
    totals.workspaces++

    // Scope the plain member to the first client only — this is what the
    // multi-tenant tests assert against.
    if (i === 0) {
      await prisma.clientWorkspaceMembership.create({
        data: { clientWorkspaceId: ws.id, userId: users.member.id, role: 'agency_member', status: 'active', acceptedAt: daysAgo(20) },
      })
      await prisma.clientWorkspaceMembership.create({
        data: { clientWorkspaceId: ws.id, userId: clientUser.id, role: 'client_admin', status: 'active', acceptedAt: daysAgo(10) },
      })
    }

    const website = await prisma.website.create({
      data: {
        clientWorkspaceId: ws.id,
        name: 'Production site',
        url: `https://${spec.domain}`,
        canonicalDomain: spec.domain,
        isPrimary: true,
        allowedWidgetDomains: [spec.domain, `www.${spec.domain}`],
      },
    })

    const assistant = await prisma.assistant.create({
      data: {
        clientWorkspaceId: ws.id,
        name: `${spec.businessName} Receptionist`,
        slug: 'receptionist',
        assistantType: 'web_chat',
        status: 'published',
        publishedAt: daysAgo(25),
        welcomeMessage: `Hi! I can help with services, pricing and booking at ${spec.businessName}. What brings you in?`,
        fallbackMessage: 'I cannot confirm that from what I have on file. If you leave your name and number, someone will follow up.',
        mode: 'sales',
        createdByUserId: users.manager.id,
      },
    })
    totals.assistants++

    const deployment = await prisma.assistantDeployment.create({
      data: {
        assistantId: assistant.id,
        websiteId: website.id,
        deploymentType: 'website_widget',
        publicKey: token(),
        status: 'active',
        allowedDomains: [spec.domain, `www.${spec.domain}`],
        lastSeenAt: daysAgo(0),
        createdByUserId: users.manager.id,
      },
    })

    // ── Knowledge ──
    const source = await prisma.knowledgeSource.create({
      data: {
        clientWorkspaceId: ws.id,
        sourceType: 'website',
        name: `${spec.domain} (website)`,
        originalUrl: `https://${spec.domain}`,
        status: 'active',
        syncStatus: 'synced',
        lastSyncedAt: daysAgo(3),
        createdByUserId: users.manager.id,
      },
    })
    await prisma.assistantKnowledgeSource.create({
      data: { assistantId: assistant.id, knowledgeSourceId: source.id, enabled: true, priority: 1 },
    })
    await prisma.crawlJob.create({
      data: {
        knowledgeSourceId: source.id, clientWorkspaceId: ws.id, requestedByUserId: users.manager.id,
        provider: 'firecrawl', providerJobId: `seed-${spec.slug}`, status: 'completed',
        pagesDiscovered: spec.pages.length, pagesProcessed: spec.pages.length,
        startedAt: daysAgo(3), completedAt: daysAgo(3),
      },
    })
    await prisma.indexingJob.create({
      data: {
        knowledgeSourceId: source.id, clientWorkspaceId: ws.id,
        provider: 'openai', model: 'text-embedding-3-small', status: 'completed',
        documentsProcessed: spec.pages.length, startedAt: daysAgo(3), completedAt: daysAgo(3),
      },
    })

    const documents = []
    for (const [path, title, body] of spec.pages) {
      const doc = await prisma.knowledgeDocument.create({
        data: {
          knowledgeSourceId: source.id, clientWorkspaceId: ws.id,
          canonicalUrl: `https://${spec.domain}${path}`, title, language: 'en',
          contentHash: createHash('sha256').update(body).digest('hex'),
          extractedText: body, status: 'active', lastCrawledAt: daysAgo(3),
        },
      })
      documents.push(doc)

      for (const [idx, text] of chunkText(body).entries()) {
        // Raw SQL: Prisma cannot write Unsupported("vector").
        const vec = `[${pseudoEmbedding(text).join(',')}]`
        await prisma.$executeRawUnsafe(
          `INSERT INTO "KnowledgeChunk"
             ("knowledgeDocumentId","clientWorkspaceId","chunkIndex","content",
              "tokenCount","contentHash","embeddingProvider","embeddingModel",
              "embeddingVersion","embedding","updatedAt")
           VALUES ($1::uuid,$2::uuid,$3,$4,$5,$6,'openai','text-embedding-3-small',1,$7::vector,NOW())`,
          doc.id, ws.id, idx, text,
          Math.ceil(text.length / 4),
          createHash('sha256').update(text).digest('hex'),
          vec
        )
        totals.chunks++
      }
    }

    // ── Lead field definitions ──
    const fieldDefs = []
    for (const [k, [key, label, fieldType]] of spec.qualifiers.entries()) {
      fieldDefs.push(
        await prisma.leadFieldDefinition.create({
          data: {
            clientWorkspaceId: ws.id, assistantId: assistant.id,
            key, label, fieldType, required: k === 2, displayOrder: k,
          },
        })
      )
    }

    // ── Conversations, leads, bookings ──
    for (let c = 0; c < 4; c++) {
      const visitor = await prisma.visitor.create({
        data: {
          clientWorkspaceId: ws.id,
          anonymousId: `seed-${spec.slug}-visitor-${c}`,
          firstSourceUrl: `https://${spec.domain}/`,
          lastSourceUrl: `https://${spec.domain}${spec.pages[0][0]}`,
          firstSeenAt: daysAgo(10 - c), lastSeenAt: daysAgo(10 - c),
        },
      })

      const captured = c < 2 // first two conversations produce leads
      const conversation = await prisma.conversation.create({
        data: {
          clientWorkspaceId: ws.id, assistantId: assistant.id, deploymentId: deployment.id,
          visitorId: visitor.id, channel: 'web_chat',
          status: captured ? 'resolved' : 'abandoned',
          handoffStatus: c === 3 ? 'completed' : 'none',
          resolutionStatus: captured ? 'resolved_by_assistant' : 'unresolved',
          startedAt: daysAgo(10 - c), lastMessageAt: daysAgo(10 - c),
          messageCount: 2, sourceUrl: `https://${spec.domain}${spec.pages[0][0]}`,
          utmSource: c % 2 ? 'google' : 'direct', detectedLanguage: 'en',
        },
      })
      totals.conversations++

      await prisma.message.create({
        data: {
          conversationId: conversation.id, clientWorkspaceId: ws.id, assistantId: assistant.id,
          role: 'visitor', messageType: 'text', content: spec.question, createdAt: daysAgo(10 - c),
        },
      })
      const reply = await prisma.message.create({
        data: {
          conversationId: conversation.id, clientWorkspaceId: ws.id, assistantId: assistant.id,
          role: 'assistant', messageType: 'text', content: spec.answer,
          modelProvider: 'google', modelName: 'gemini-2.5-flash-lite',
          promptTokens: 820, completionTokens: 96, latencyMs: 740,
          createdAt: daysAgo(10 - c),
        },
      })
      await prisma.messageCitation.create({
        data: {
          messageId: reply.id, knowledgeDocumentId: documents[0].id,
          sourceUrl: documents[0].canonicalUrl, title: documents[0].title, relevanceScore: 0.86,
        },
      })

      await prisma.usageEvent.create({
        data: {
          organizationId: org.id, clientWorkspaceId: ws.id, assistantId: assistant.id,
          conversationId: conversation.id, eventType: 'assistant_message', quantity: 1n, unit: 'message',
          provider: 'google', model: 'gemini-2.5-flash-lite',
          promptTokens: 820, completionTokens: 96, estimatedCostMinor: 1, currency: 'USD',
          idempotencyKey: `seed-msg-${conversation.id}`, occurredAt: daysAgo(10 - c),
        },
      })
      totals.usage++

      if (!captured) continue

      const lead = await prisma.lead.create({
        data: {
          clientWorkspaceId: ws.id, assistantId: assistant.id, conversationId: conversation.id,
          visitorId: visitor.id,
          name: ['Sarah Mitchell', 'James Kowalski'][c],
          // Second lead is PHONE-ONLY on purpose: the old schema could not
          // store this, and it is the common case for home services.
          email: c === 0 ? `sarah.mitchell@seed.invalid` : null,
          phone: ['(555) 014-2288', '(555) 771-0043'][c],
          status: c === 0 ? 'qualified' : 'new',
          qualificationStatus: c === 0 ? 'qualified' : 'unreviewed',
          source: 'web_chat', assignedToUserId: c === 0 ? users.member.id : null,
          consentStatus: 'granted', createdAt: daysAgo(10 - c),
        },
      })
      totals.leads++
      await prisma.conversation.update({ where: { id: conversation.id }, data: { leadId: lead.id } })

      for (const [k, def] of fieldDefs.entries()) {
        await prisma.leadFieldValue.create({
          data: {
            leadId: lead.id, fieldDefinitionId: def.id,
            valueBoolean: def.fieldType === 'boolean' ? k % 2 === 0 : null,
            valueDate: def.fieldType === 'date' ? daysAgo(14) : null,
            valueText: ['boolean', 'date'].includes(def.fieldType)
              ? null
              : ['Whitening', '(555) 014-2288', 'Saturday morning'][k % 3],
          },
        })
      }

      if (c === 0) {
        await prisma.bookingRequest.create({
          data: {
            clientWorkspaceId: ws.id, assistantId: assistant.id,
            conversationId: conversation.id, leadId: lead.id,
            // requested, NOT confirmed — no calendar integration exists.
            status: 'requested',
            requestedStartAt: new Date(Date.now() + 3 * 86_400_000),
            timezone: 'America/New_York',
            phone: '(555) 014-2288', notes: 'Prefers Saturday morning.',
          },
        })
        totals.bookings++
      }
    }
  }

  // ── A prospect demo, to exercise the outreach path ──
  console.log('→ Prospect demo workspace…')
  const demoWs = await prisma.clientWorkspace.create({
    data: {
      organizationId: org.id,
      name: '[DEV] Lumen Aesthetics (prospect)',
      slug: 'prospect-lumen-aesthetics',
      businessName: 'Lumen Aesthetics',
      workspaceType: 'prospect_demo',
      industry: 'medspa',
      websiteUrl: 'https://lumenaesthetics.example',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 86_400_000),
      createdByUserId: users.manager.id,
      settings: SEED_TAG,
    },
  })
  const demoAssistant = await prisma.assistant.create({
    data: {
      clientWorkspaceId: demoWs.id, name: 'Lumen Aesthetics Receptionist',
      slug: 'receptionist', status: 'draft',
      welcomeMessage: 'Hi! Ask me anything about treatments, pricing or booking.',
      createdByUserId: users.manager.id,
    },
  })
  const demoDeployment = await prisma.assistantDeployment.create({
    data: {
      assistantId: demoAssistant.id, deploymentType: 'shareable_demo',
      publicKey: token(), shareToken: token(), status: 'active',
      expiresAt: new Date(Date.now() + 30 * 86_400_000),
      configuration: {
        suggestedQuestions: [
          'Do you offer laser hair removal?',
          'Are consultations free?',
          'How do I book an appointment?',
        ],
      },
      createdByUserId: users.manager.id,
    },
  })
  for (const type of ['opened', 'opened', 'conversation_started']) {
    await prisma.deploymentEngagementEvent.create({
      data: { deploymentId: demoDeployment.id, eventType: type, anonymousId: 'seed-prospect', occurredAt: daysAgo(2) },
    })
  }
  totals.workspaces++
  totals.assistants++

  await prisma.auditLog.create({
    data: {
      organizationId: org.id, actorUserId: users.owner.id,
      action: 'seed.completed', entityType: 'Organization', entityId: org.id,
      afterData: { note: 'development seed data' },
    },
  })

  console.log('\n── Seeded ──')
  console.table(totals)
  console.log(`\nOrganization: ${org.name} (${org.slug})`)
  console.log('Sign-in identities (Clerk ids are fake — for tests, not login):')
  console.log('  owner    ava.owner@seed.invalid')
  console.log('  manager  ben.manager@seed.invalid')
  console.log('  member   cleo.member@seed.invalid  → scoped to Bright Smile Dental ONLY')
  console.log('  analyst  dana.analyst@seed.invalid → read-only, no export')
  console.log('  client   reception@seed.invalid    → client_admin on Bright Smile Dental ONLY')
  console.log(`\nDemo share token: ${demoDeployment.shareToken}`)
}

main()
  .catch((e) => { console.error('✖', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
