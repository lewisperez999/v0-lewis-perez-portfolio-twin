-- Database Optimization SQL
-- Performance indexes for the Lewis Perez Portfolio Twin application
-- Run this file to add indexes for faster query performance

-- ============================================
-- Experiences Table Indexes
-- ============================================

-- Index for experience queries (ordered by start_date)
CREATE INDEX IF NOT EXISTS idx_experiences_start_date 
ON experiences(start_date DESC);

-- Index for filtering by professional_id and ordering
CREATE INDEX IF NOT EXISTS idx_experiences_professional_dates 
ON experiences(professional_id, start_date DESC);

-- ============================================
-- Skills Table Indexes
-- ============================================

-- Index for skills category lookup
CREATE INDEX IF NOT EXISTS idx_skills_category 
ON skills(category, proficiency);

-- Index for skills by professional_id
CREATE INDEX IF NOT EXISTS idx_skills_professional 
ON skills(professional_id, category);

-- ============================================
-- Projects Table Indexes
-- ============================================

-- Index for projects ordered by created_at
CREATE INDEX IF NOT EXISTS idx_projects_created_at 
ON projects(created_at DESC);

-- Index for projects by professional_id
CREATE INDEX IF NOT EXISTS idx_projects_professional 
ON projects(professional_id, created_at DESC);

-- ============================================
-- Content Chunks Table Indexes
-- ============================================

-- Index for content search by type
CREATE INDEX IF NOT EXISTS idx_content_chunks_type 
ON content_chunks(chunk_type, created_at DESC);

-- Index for content chunks by professional_id
CREATE INDEX IF NOT EXISTS idx_content_chunks_professional 
ON content_chunks(professional_id, chunk_type);

-- Full-text search index for content (if content column exists as TEXT)
-- Note: This requires the content column to exist in content_chunks table
-- CREATE INDEX IF NOT EXISTS idx_content_chunks_search 
-- ON content_chunks USING GIN(to_tsvector('english', content));

-- ============================================
-- Personal Info Table Indexes
-- ============================================

-- Index for personal info by ID (if table exists)
CREATE INDEX IF NOT EXISTS idx_personal_info_id 
ON personal_info(id);

-- ============================================
-- Conversation Logs Table Indexes (if exists)
-- ============================================

-- Index for conversation logs by timestamp
-- CREATE INDEX IF NOT EXISTS idx_conversation_logs_created 
-- ON conversation_logs(created_at DESC);

-- Index for conversation logs by user_id
-- CREATE INDEX IF NOT EXISTS idx_conversation_logs_user 
-- ON conversation_logs(user_id, created_at DESC);

-- ============================================
-- Performance Analysis
-- ============================================

-- To verify index usage, run these commands after creating indexes:
-- EXPLAIN ANALYZE SELECT * FROM experiences ORDER BY start_date DESC;
-- EXPLAIN ANALYZE SELECT * FROM skills WHERE category = 'Programming Languages';
-- EXPLAIN ANALYZE SELECT * FROM projects ORDER BY created_at DESC;

-- To check index sizes:
-- SELECT
--     indexname,
--     indexdef,
--     pg_size_pretty(pg_relation_size(indexrelid)) as index_size
-- FROM pg_indexes
-- JOIN pg_class ON pg_class.relname = indexname
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;
