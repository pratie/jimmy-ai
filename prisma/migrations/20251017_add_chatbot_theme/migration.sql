-- Add theme JSONB column to ChatBot for appearance settings
-- Safe no-op if already present
ALTER TABLE "ChatBot" ADD COLUMN IF NOT EXISTS "theme" JSONB;

