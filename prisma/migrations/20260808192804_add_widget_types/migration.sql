-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WidgetType" ADD VALUE 'NEWSLETTER_BAR';
ALTER TYPE "WidgetType" ADD VALUE 'EXIT_INTENT';
ALTER TYPE "WidgetType" ADD VALUE 'WAITLIST';
ALTER TYPE "WidgetType" ADD VALUE 'FEEDBACK_NPS';
ALTER TYPE "WidgetType" ADD VALUE 'CHAT_BUBBLE';
ALTER TYPE "WidgetType" ADD VALUE 'DISCOUNT_REVEAL';
ALTER TYPE "WidgetType" ADD VALUE 'EVENT_RSVP';
