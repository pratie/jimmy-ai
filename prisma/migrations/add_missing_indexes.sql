-- Add missing indexes for performance optimization
-- Run this migration to improve query performance

-- Domain foreign keys (for user/campaign queries)
CREATE INDEX IF NOT EXISTS "Domain_userId_idx" ON "Domain"("userId");
CREATE INDEX IF NOT EXISTS "Domain_campaignId_idx" ON "Domain"("campaignId");

-- FilterQuestions (for domain-scoped queries)
CREATE INDEX IF NOT EXISTS "FilterQuestions_domainId_idx" ON "FilterQuestions"("domainId");

-- HelpDesk (for domain-scoped queries)
CREATE INDEX IF NOT EXISTS "HelpDesk_domainId_idx" ON "HelpDesk"("domainId");

-- Customer (for domain-scoped queries)
CREATE INDEX IF NOT EXISTS "Customer_domainId_idx" ON "Customer"("domainId");

-- ChatMessage (for chatroom message queries)
CREATE INDEX IF NOT EXISTS "ChatMessage_chatRoomId_idx" ON "ChatMessage"("chatRoomId");

-- Product (for domain product queries)
CREATE INDEX IF NOT EXISTS "Product_domainId_idx" ON "Product"("domainId");

-- CustomerResponses (for customer question queries)
CREATE INDEX IF NOT EXISTS "CustomerResponses_customerId_idx" ON "CustomerResponses"("customerId");

-- Bookings (for customer/domain booking queries)
CREATE INDEX IF NOT EXISTS "Bookings_customerId_idx" ON "Bookings"("customerId");
CREATE INDEX IF NOT EXISTS "Bookings_domainId_idx" ON "Bookings"("domainId");

-- Campaign (for user campaign queries)
CREATE INDEX IF NOT EXISTS "Campaign_userId_idx" ON "Campaign"("userId");
