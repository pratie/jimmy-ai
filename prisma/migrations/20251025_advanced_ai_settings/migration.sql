-- Advanced AI Settings for ChatBot
-- Adds model selection, temperature, and per-mode prompt overrides

ALTER TABLE "ChatBot" 
  ADD COLUMN IF NOT EXISTS "llmModel" TEXT;

ALTER TABLE "ChatBot" 
  ADD COLUMN IF NOT EXISTS "llmTemperature" DOUBLE PRECISION DEFAULT 0.7;

ALTER TABLE "ChatBot" 
  ADD COLUMN IF NOT EXISTS "modePrompts" JSONB;

-- Set default model if null (best-effort, safe to run multiple times)
UPDATE "ChatBot" SET "llmModel" = 'gpt-4o-mini' WHERE "llmModel" IS NULL;
