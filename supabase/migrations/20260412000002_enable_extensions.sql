-- ============================================================
-- PaintBookCo — Enable PostGIS and pgvector extensions
-- Migration: 20260412000002_enable_extensions
-- ============================================================

-- PostGIS — geographic queries and ST_DWithin matching
CREATE EXTENSION IF NOT EXISTS postgis;

-- pgvector — AI embedding storage (Paint Vestimator, future features)
CREATE EXTENSION IF NOT EXISTS vector;
