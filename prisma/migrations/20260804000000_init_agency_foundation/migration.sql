-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'deactivated');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('agency', 'direct_business', 'internal');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('active', 'past_due', 'suspended', 'archived');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('not_started', 'organization_created', 'first_client_created', 'first_assistant_created', 'first_deployment_live', 'completed');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('owner', 'admin', 'manager', 'member', 'analyst', 'billing');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('invited', 'active', 'suspended', 'revoked');

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('active_client', 'direct_business', 'prospect_demo', 'internal_demo');

-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('agency_manager', 'agency_member', 'client_admin', 'client_member', 'client_viewer');

-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "AssistantType" AS ENUM ('web_chat', 'internal_test', 'future_voice_inbound', 'future_voice_outbound');

-- CreateEnum
CREATE TYPE "AssistantStatus" AS ENUM ('draft', 'published', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "AssistantMode" AS ENUM ('sales', 'support', 'faq');

-- CreateEnum
CREATE TYPE "DeploymentType" AS ENUM ('website_widget', 'preview', 'shareable_demo', 'future_api', 'future_voice');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('active', 'paused', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "EngagementEventType" AS ENUM ('opened', 'conversation_started', 'cta_clicked');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('website', 'sitemap', 'uploaded_file', 'manual_text', 'faq', 'integration');

-- CreateEnum
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('active', 'paused', 'failed', 'archived');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('never_synced', 'queued', 'syncing', 'synced', 'partially_synced', 'failed');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('active', 'stale', 'failed', 'archived');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('queued', 'running', 'completed', 'partially_completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('unknown', 'granted', 'denied', 'withdrawn');

-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('web_chat', 'preview', 'shareable_demo', 'future_voice', 'future_api');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('active', 'resolved', 'abandoned', 'spam', 'archived');

-- CreateEnum
CREATE TYPE "HandoffStatus" AS ENUM ('none', 'requested', 'accepted', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('unresolved', 'resolved_by_assistant', 'resolved_by_human', 'escalated', 'no_answer_available');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('visitor', 'assistant', 'human_agent', 'system', 'tool');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'lead_form', 'booking_request', 'system_event', 'tool_call', 'future_transcript');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('streaming', 'complete', 'failed', 'filtered');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'closed', 'spam');

-- CreateEnum
CREATE TYPE "QualificationStatus" AS ENUM ('unreviewed', 'qualified', 'disqualified', 'needs_follow_up');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('web_chat', 'preview', 'shareable_demo', 'manual', 'import', 'future_voice');

-- CreateEnum
CREATE TYPE "LeadFieldType" AS ENUM ('text', 'textarea', 'email', 'phone', 'number', 'boolean', 'single_select', 'multi_select', 'date');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('requested', 'pending', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('fixed', 'starting_at', 'hourly', 'quote_required', 'free');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "EntitlementKey" AS ENUM ('maximum_client_workspaces', 'maximum_assistants', 'monthly_messages', 'monthly_crawl_pages', 'maximum_training_sources', 'storage_bytes', 'maximum_team_members', 'maximum_client_users', 'maximum_prospect_demos', 'hide_branding', 'shareable_demos', 'client_portal', 'custom_domain', 'advanced_reporting', 'api_access', 'future_voice_minutes');

-- CreateEnum
CREATE TYPE "UsageEventType" AS ENUM ('assistant_message', 'embedding_generated', 'rerank_request', 'crawl_page', 'file_processed', 'storage_used', 'future_voice_minute', 'future_transcription_second', 'future_tts_character');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('received', 'processing', 'processed', 'failed', 'ignored');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('calendar', 'crm', 'automation', 'webhook', 'email', 'future_voice');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('connected', 'degraded', 'disconnected', 'error');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organizationType" "OrganizationType" NOT NULL DEFAULT 'agency',
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "customDomain" TEXT,
    "hideChatDockBranding" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" "OrganizationStatus" NOT NULL DEFAULT 'active',
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'not_started',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMembership" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'member',
    "status" "MembershipStatus" NOT NULL DEFAULT 'invited',
    "invitedByUserId" UUID,
    "invitedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientWorkspace" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "businessName" TEXT,
    "workspaceType" "WorkspaceType" NOT NULL DEFAULT 'active_client',
    "industry" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" JSONB,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'active',
    "settings" JSONB,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "ClientWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientWorkspaceMembership" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'invited',
    "invitedByUserId" UUID,
    "invitedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientWorkspaceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonicalDomain" TEXT NOT NULL,
    "status" "WebsiteStatus" NOT NULL DEFAULT 'active',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "allowedWidgetDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "assistantType" "AssistantType" NOT NULL DEFAULT 'web_chat',
    "status" "AssistantStatus" NOT NULL DEFAULT 'draft',
    "description" TEXT,
    "welcomeMessage" TEXT,
    "fallbackMessage" TEXT,
    "systemInstructions" TEXT,
    "mode" "AssistantMode" NOT NULL DEFAULT 'sales',
    "brandTone" TEXT DEFAULT 'friendly, concise',
    "language" TEXT NOT NULL DEFAULT 'en',
    "modelProvider" TEXT NOT NULL DEFAULT 'google',
    "modelName" TEXT NOT NULL DEFAULT 'gemini-2.5-flash-lite',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "leadCaptureEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "humanHandoffEnabled" BOOLEAN NOT NULL DEFAULT true,
    "citationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "behaviorSettings" JSONB,
    "brandingSettings" JSONB,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantDeployment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assistantId" UUID NOT NULL,
    "websiteId" UUID,
    "deploymentType" "DeploymentType" NOT NULL,
    "publicKey" TEXT NOT NULL,
    "shareToken" TEXT,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'active',
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "configuration" JSONB,
    "expiresAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "AssistantDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeploymentEngagementEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deploymentId" UUID NOT NULL,
    "eventType" "EngagementEventType" NOT NULL,
    "anonymousId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeploymentEngagementEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "sourceType" "KnowledgeSourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "originalUrl" TEXT,
    "storagePath" TEXT,
    "mimeType" TEXT,
    "status" "KnowledgeSourceStatus" NOT NULL DEFAULT 'active',
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'never_synced',
    "metadata" JSONB,
    "createdByUserId" UUID,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "knowledgeSourceId" UUID NOT NULL,
    "clientWorkspaceId" UUID NOT NULL,
    "externalId" TEXT,
    "canonicalUrl" TEXT,
    "title" TEXT,
    "language" TEXT,
    "contentHash" TEXT,
    "extractedText" TEXT,
    "rawContentPath" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "lastCrawledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "knowledgeDocumentId" UUID NOT NULL,
    "clientWorkspaceId" UUID NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "contentHash" TEXT,
    "metadata" JSONB,
    "embeddingProvider" TEXT NOT NULL DEFAULT 'openai',
    "embeddingModel" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "embeddingVersion" INTEGER NOT NULL DEFAULT 1,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantKnowledgeSource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assistantId" UUID NOT NULL,
    "knowledgeSourceId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantKnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlJob" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "knowledgeSourceId" UUID NOT NULL,
    "clientWorkspaceId" UUID NOT NULL,
    "requestedByUserId" UUID,
    "provider" TEXT NOT NULL,
    "providerJobId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "configuration" JSONB,
    "pagesDiscovered" INTEGER NOT NULL DEFAULT 0,
    "pagesProcessed" INTEGER NOT NULL DEFAULT 0,
    "pagesFailed" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawlJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexingJob" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "knowledgeSourceId" UUID NOT NULL,
    "clientWorkspaceId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "embeddingVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "documentsProcessed" INTEGER NOT NULL DEFAULT 0,
    "chunksCreated" INTEGER NOT NULL DEFAULT 0,
    "chunksFailed" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndexingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstSourceUrl" TEXT,
    "lastSourceUrl" TEXT,
    "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'unknown',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "assistantId" UUID NOT NULL,
    "deploymentId" UUID,
    "visitorId" UUID,
    "leadId" UUID,
    "channel" "ConversationChannel" NOT NULL DEFAULT 'web_chat',
    "status" "ConversationStatus" NOT NULL DEFAULT 'active',
    "handoffStatus" "HandoffStatus" NOT NULL DEFAULT 'none',
    "resolutionStatus" "ResolutionStatus" NOT NULL DEFAULT 'unresolved',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "sourceUrl" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "detectedLanguage" TEXT,
    "summary" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversationId" UUID NOT NULL,
    "clientWorkspaceId" UUID NOT NULL,
    "assistantId" UUID,
    "role" "MessageRole" NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "structuredContent" JSONB,
    "modelProvider" TEXT,
    "modelName" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "latencyMs" INTEGER,
    "status" "MessageStatus" NOT NULL DEFAULT 'complete',
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageCitation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "messageId" UUID NOT NULL,
    "knowledgeDocumentId" UUID,
    "knowledgeChunkId" UUID,
    "sourceUrl" TEXT,
    "title" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "assistantId" UUID,
    "conversationId" UUID,
    "visitorId" UUID,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "qualificationStatus" "QualificationStatus" NOT NULL DEFAULT 'unreviewed',
    "source" "LeadSource" NOT NULL DEFAULT 'web_chat',
    "assignedToUserId" UUID,
    "notes" TEXT,
    "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'unknown',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadFieldDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "assistantId" UUID,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" "LeadFieldType" NOT NULL DEFAULT 'text',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "validationRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadFieldValue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "fieldDefinitionId" UUID NOT NULL,
    "valueText" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "valueBoolean" BOOLEAN,
    "valueDate" TIMESTAMP(3),
    "valueJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "assistantId" UUID,
    "conversationId" UUID,
    "leadId" UUID,
    "integrationId" UUID,
    "status" "BookingStatus" NOT NULL DEFAULT 'requested',
    "requestedStartAt" TIMESTAMP(3),
    "requestedEndAt" TIMESTAMP(3),
    "confirmedStartAt" TIMESTAMP(3),
    "confirmedEndAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "externalEventId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientWorkspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceAmountMinor" INTEGER,
    "currency" CHAR(3),
    "pricingType" "PricingType" NOT NULL DEFAULT 'quote_required',
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "monthlyPriceMinor" INTEGER NOT NULL DEFAULT 0,
    "yearlyPriceMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "planId" UUID,
    "provider" TEXT NOT NULL DEFAULT 'dodo',
    "externalCustomerId" TEXT,
    "externalSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'monthly',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEntitlement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "planId" UUID NOT NULL,
    "key" "EntitlementKey" NOT NULL,
    "limitValue" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationEntitlement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "key" "EntitlementKey" NOT NULL,
    "limitValue" BIGINT,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "clientWorkspaceId" UUID,
    "assistantId" UUID,
    "conversationId" UUID,
    "eventType" "UsageEventType" NOT NULL,
    "quantity" BIGINT NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL,
    "provider" TEXT,
    "model" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "estimatedCostMinor" INTEGER,
    "currency" CHAR(3),
    "idempotencyKey" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "externalEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'received',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "payloadMetadata" JSONB,

    CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "clientWorkspaceId" UUID,
    "integrationType" "IntegrationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'connected',
    "encryptedCredentials" TEXT,
    "configuration" JSONB,
    "connectedByUserId" UUID,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disconnectedAt" TIMESTAMP(3),

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID,
    "clientWorkspaceId" UUID,
    "actorUserId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_customDomain_key" ON "Organization"("customDomain");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "Organization_organizationType_idx" ON "Organization"("organizationType");

-- CreateIndex
CREATE INDEX "OrganizationMembership_userId_status_idx" ON "OrganizationMembership"("userId", "status");

-- CreateIndex
CREATE INDEX "OrganizationMembership_organizationId_role_idx" ON "OrganizationMembership"("organizationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userId_key" ON "OrganizationMembership"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "ClientWorkspace_organizationId_status_idx" ON "ClientWorkspace"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ClientWorkspace_workspaceType_expiresAt_idx" ON "ClientWorkspace"("workspaceType", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientWorkspace_organizationId_slug_key" ON "ClientWorkspace"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "ClientWorkspaceMembership_userId_status_idx" ON "ClientWorkspaceMembership"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ClientWorkspaceMembership_clientWorkspaceId_userId_key" ON "ClientWorkspaceMembership"("clientWorkspaceId", "userId");

-- CreateIndex
CREATE INDEX "Website_clientWorkspaceId_status_idx" ON "Website"("clientWorkspaceId", "status");

-- CreateIndex
CREATE INDEX "Website_canonicalDomain_idx" ON "Website"("canonicalDomain");

-- CreateIndex
CREATE INDEX "Assistant_clientWorkspaceId_status_idx" ON "Assistant"("clientWorkspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_clientWorkspaceId_slug_key" ON "Assistant"("clientWorkspaceId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantDeployment_publicKey_key" ON "AssistantDeployment"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantDeployment_shareToken_key" ON "AssistantDeployment"("shareToken");

-- CreateIndex
CREATE INDEX "AssistantDeployment_assistantId_status_idx" ON "AssistantDeployment"("assistantId", "status");

-- CreateIndex
CREATE INDEX "AssistantDeployment_websiteId_idx" ON "AssistantDeployment"("websiteId");

-- CreateIndex
CREATE INDEX "AssistantDeployment_deploymentType_status_idx" ON "AssistantDeployment"("deploymentType", "status");

-- CreateIndex
CREATE INDEX "DeploymentEngagementEvent_deploymentId_eventType_occurredAt_idx" ON "DeploymentEngagementEvent"("deploymentId", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "KnowledgeSource_clientWorkspaceId_status_idx" ON "KnowledgeSource"("clientWorkspaceId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeSource_syncStatus_idx" ON "KnowledgeSource"("syncStatus");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_clientWorkspaceId_status_idx" ON "KnowledgeDocument"("clientWorkspaceId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_contentHash_idx" ON "KnowledgeDocument"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeDocument_knowledgeSourceId_canonicalUrl_key" ON "KnowledgeDocument"("knowledgeSourceId", "canonicalUrl");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_clientWorkspaceId_embeddingVersion_idx" ON "KnowledgeChunk"("clientWorkspaceId", "embeddingVersion");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_knowledgeDocumentId_idx" ON "KnowledgeChunk"("knowledgeDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeChunk_knowledgeDocumentId_chunkIndex_embeddingVers_key" ON "KnowledgeChunk"("knowledgeDocumentId", "chunkIndex", "embeddingVersion");

-- CreateIndex
CREATE INDEX "AssistantKnowledgeSource_assistantId_enabled_idx" ON "AssistantKnowledgeSource"("assistantId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantKnowledgeSource_assistantId_knowledgeSourceId_key" ON "AssistantKnowledgeSource"("assistantId", "knowledgeSourceId");

-- CreateIndex
CREATE INDEX "CrawlJob_knowledgeSourceId_status_idx" ON "CrawlJob"("knowledgeSourceId", "status");

-- CreateIndex
CREATE INDEX "CrawlJob_clientWorkspaceId_status_idx" ON "CrawlJob"("clientWorkspaceId", "status");

-- CreateIndex
CREATE INDEX "CrawlJob_provider_providerJobId_idx" ON "CrawlJob"("provider", "providerJobId");

-- CreateIndex
CREATE INDEX "IndexingJob_knowledgeSourceId_status_idx" ON "IndexingJob"("knowledgeSourceId", "status");

-- CreateIndex
CREATE INDEX "IndexingJob_clientWorkspaceId_status_idx" ON "IndexingJob"("clientWorkspaceId", "status");

-- CreateIndex
CREATE INDEX "Visitor_clientWorkspaceId_lastSeenAt_idx" ON "Visitor"("clientWorkspaceId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_clientWorkspaceId_anonymousId_key" ON "Visitor"("clientWorkspaceId", "anonymousId");

-- CreateIndex
CREATE INDEX "Conversation_clientWorkspaceId_status_lastMessageAt_idx" ON "Conversation"("clientWorkspaceId", "status", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_assistantId_startedAt_idx" ON "Conversation"("assistantId", "startedAt");

-- CreateIndex
CREATE INDEX "Conversation_channel_status_idx" ON "Conversation"("channel", "status");

-- CreateIndex
CREATE INDEX "Conversation_handoffStatus_idx" ON "Conversation"("handoffStatus");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_clientWorkspaceId_createdAt_idx" ON "Message"("clientWorkspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageCitation_messageId_idx" ON "MessageCitation"("messageId");

-- CreateIndex
CREATE INDEX "Lead_clientWorkspaceId_status_createdAt_idx" ON "Lead"("clientWorkspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_clientWorkspaceId_email_idx" ON "Lead"("clientWorkspaceId", "email");

-- CreateIndex
CREATE INDEX "Lead_clientWorkspaceId_phone_idx" ON "Lead"("clientWorkspaceId", "phone");

-- CreateIndex
CREATE INDEX "Lead_assignedToUserId_idx" ON "Lead"("assignedToUserId");

-- CreateIndex
CREATE INDEX "LeadFieldDefinition_assistantId_enabled_displayOrder_idx" ON "LeadFieldDefinition"("assistantId", "enabled", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "LeadFieldDefinition_clientWorkspaceId_assistantId_key_key" ON "LeadFieldDefinition"("clientWorkspaceId", "assistantId", "key");

-- CreateIndex
CREATE INDEX "LeadFieldValue_fieldDefinitionId_idx" ON "LeadFieldValue"("fieldDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadFieldValue_leadId_fieldDefinitionId_key" ON "LeadFieldValue"("leadId", "fieldDefinitionId");

-- CreateIndex
CREATE INDEX "BookingRequest_clientWorkspaceId_status_requestedStartAt_idx" ON "BookingRequest"("clientWorkspaceId", "status", "requestedStartAt");

-- CreateIndex
CREATE INDEX "BookingRequest_leadId_idx" ON "BookingRequest"("leadId");

-- CreateIndex
CREATE INDEX "ServiceItem_clientWorkspaceId_active_idx" ON "ServiceItem"("clientWorkspaceId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_externalSubscriptionId_key" ON "Subscription"("externalSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_provider_externalCustomerId_idx" ON "Subscription"("provider", "externalCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanEntitlement_planId_key_key" ON "PlanEntitlement"("planId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationEntitlement_organizationId_key_key" ON "OrganizationEntitlement"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "UsageEvent_idempotencyKey_key" ON "UsageEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "UsageEvent_organizationId_eventType_occurredAt_idx" ON "UsageEvent"("organizationId", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "UsageEvent_clientWorkspaceId_occurredAt_idx" ON "UsageEvent"("clientWorkspaceId", "occurredAt");

-- CreateIndex
CREATE INDEX "UsageEvent_assistantId_occurredAt_idx" ON "UsageEvent"("assistantId", "occurredAt");

-- CreateIndex
CREATE INDEX "BillingEvent_processingStatus_receivedAt_idx" ON "BillingEvent"("processingStatus", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEvent_provider_externalEventId_key" ON "BillingEvent"("provider", "externalEventId");

-- CreateIndex
CREATE INDEX "Integration_organizationId_integrationType_status_idx" ON "Integration"("organizationId", "integrationType", "status");

-- CreateIndex
CREATE INDEX "Integration_clientWorkspaceId_idx" ON "Integration"("clientWorkspaceId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_clientWorkspaceId_createdAt_idx" ON "AuditLog"("clientWorkspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientWorkspace" ADD CONSTRAINT "ClientWorkspace_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientWorkspace" ADD CONSTRAINT "ClientWorkspace_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientWorkspaceMembership" ADD CONSTRAINT "ClientWorkspaceMembership_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientWorkspaceMembership" ADD CONSTRAINT "ClientWorkspaceMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientWorkspaceMembership" ADD CONSTRAINT "ClientWorkspaceMembership_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantDeployment" ADD CONSTRAINT "AssistantDeployment_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantDeployment" ADD CONSTRAINT "AssistantDeployment_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantDeployment" ADD CONSTRAINT "AssistantDeployment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeploymentEngagementEvent" ADD CONSTRAINT "DeploymentEngagementEvent_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "AssistantDeployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_knowledgeDocumentId_fkey" FOREIGN KEY ("knowledgeDocumentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantKnowledgeSource" ADD CONSTRAINT "AssistantKnowledgeSource_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantKnowledgeSource" ADD CONSTRAINT "AssistantKnowledgeSource_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlJob" ADD CONSTRAINT "CrawlJob_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlJob" ADD CONSTRAINT "CrawlJob_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlJob" ADD CONSTRAINT "CrawlJob_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndexingJob" ADD CONSTRAINT "IndexingJob_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndexingJob" ADD CONSTRAINT "IndexingJob_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "AssistantDeployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageCitation" ADD CONSTRAINT "MessageCitation_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageCitation" ADD CONSTRAINT "MessageCitation_knowledgeDocumentId_fkey" FOREIGN KEY ("knowledgeDocumentId") REFERENCES "KnowledgeDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageCitation" ADD CONSTRAINT "MessageCitation_knowledgeChunkId_fkey" FOREIGN KEY ("knowledgeChunkId") REFERENCES "KnowledgeChunk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFieldDefinition" ADD CONSTRAINT "LeadFieldDefinition_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFieldDefinition" ADD CONSTRAINT "LeadFieldDefinition_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFieldValue" ADD CONSTRAINT "LeadFieldValue_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFieldValue" ADD CONSTRAINT "LeadFieldValue_fieldDefinitionId_fkey" FOREIGN KEY ("fieldDefinitionId") REFERENCES "LeadFieldDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItem" ADD CONSTRAINT "ServiceItem_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEntitlement" ADD CONSTRAINT "PlanEntitlement_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationEntitlement" ADD CONSTRAINT "OrganizationEntitlement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_connectedByUserId_fkey" FOREIGN KEY ("connectedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

