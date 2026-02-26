-- ============================================
-- Migration 007: Add notes to rides
-- ============================================

ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS notes TEXT;
