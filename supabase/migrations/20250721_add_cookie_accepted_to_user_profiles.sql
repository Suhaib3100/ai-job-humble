-- Migration: Add cookie_accepted column to user_profiles
-- Created: 2025-07-21

ALTER TABLE public.user_profiles
ADD COLUMN cookie_accepted BOOLEAN DEFAULT FALSE;
