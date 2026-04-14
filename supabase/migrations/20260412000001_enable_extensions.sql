-- ============================================================
-- PaintBookCo — Enable extensions
-- Migration: 20260412000001_enable_extensions
-- ============================================================
-- Must run first. PostGIS is required for geography columns
-- and ST_DWithin matching. pgvector is used by the Vestimator.
-- ============================================================

-- Geographic queries and ST_DWithin proximity matching
CREATE EXTENSION IF NOT EXISTS postgis;

-- AI embedding storage (Paint Vestimator)
CREATE EXTENSION IF NOT EXISTS vector;
