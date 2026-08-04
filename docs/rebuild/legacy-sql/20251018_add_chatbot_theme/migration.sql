-- AddThemeColumnToChatBot
-- Add theme JSON column to ChatBot table for storing customization settings

-- Add the theme column to the ChatBot table
ALTER TABLE "ChatBot" ADD COLUMN IF NOT EXISTS "theme" JSONB;

-- Add a comment to describe the column
COMMENT ON COLUMN "ChatBot"."theme" IS 'JSON object containing theme customization settings (colors, radius, shadow, etc.)';
