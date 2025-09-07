-- Lewis Perez Portfolio Database Schema - ACTUAL WORKING STRUCTURE
-- PostgreSQL schema for professional portfolio, MCP tools, and conversation logging
-- Updated to match the actual production database structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE PROFESSIONAL DATA TABLES
-- ============================================

-- Professional information (single record)
CREATE TABLE IF NOT EXISTS personal_info (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    summary TEXT,
    bio TEXT,
    tagline TEXT,
    highlights TEXT[],
    website VARCHAR(500),
    linkedin VARCHAR(500),
    github VARCHAR(500),
    twitter VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills and competencies
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER NOT NULL DEFAULT nextval('skills_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    category VARCHAR(255),
    skill_name VARCHAR(255) NOT NULL,
    proficiency VARCHAR(50),
    experience_years VARCHAR(20),
    context TEXT,
    projects TEXT[],
    skill_type VARCHAR(50) DEFAULT 'technical',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for skills table
CREATE SEQUENCE IF NOT EXISTS skills_id_seq;

-- Projects portfolio
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER NOT NULL DEFAULT nextval('projects_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    technologies TEXT[],
    role VARCHAR(255),
    outcomes TEXT[],
    challenges TEXT[],
    demo_url VARCHAR(500),
    repository_url VARCHAR(500),
    documentation_url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for projects table
CREATE SEQUENCE IF NOT EXISTS projects_id_seq;

-- Professional experience
CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER NOT NULL DEFAULT nextval('experiences_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    duration VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    achievements TEXT[],
    technologies TEXT[],
    skills_developed TEXT[],
    impact TEXT,
    keywords TEXT[],
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for experiences table
CREATE SEQUENCE IF NOT EXISTS experiences_id_seq;

-- Content chunks for vector search and MCP tools
CREATE TABLE IF NOT EXISTS content_chunks (
    id INTEGER NOT NULL DEFAULT nextval('content_chunks_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    chunk_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    chunk_type VARCHAR(100),
    title VARCHAR(500),
    metadata JSONB,
    importance VARCHAR(20),
    date_range VARCHAR(50),
    search_weight INTEGER DEFAULT 5,
    vector_id VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_file VARCHAR(255),
    word_count INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for content_chunks table
CREATE SEQUENCE IF NOT EXISTS content_chunks_id_seq;

-- ============================================
-- CONVERSATION LOGGING AND ANALYTICS
-- ============================================

-- Main conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    response_time_ms INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('answered', 'pending', 'failed')),
    model_used VARCHAR(100),
    vector_sources JSONB,
    context_used TEXT,
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ADDITIONAL SUPPORTING TABLES (if needed)
-- ============================================

-- Education information
CREATE TABLE IF NOT EXISTS education (
    id INTEGER NOT NULL DEFAULT nextval('education_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    institution VARCHAR(255),
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for education table
CREATE SEQUENCE IF NOT EXISTS education_id_seq;

-- Professionals table (for multi-user support)
CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER NOT NULL DEFAULT nextval('professionals_id_seq'::regclass) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for professionals table
CREATE SEQUENCE IF NOT EXISTS professionals_id_seq;

-- Content sources tracking
CREATE TABLE IF NOT EXISTS content_sources (
    id INTEGER NOT NULL DEFAULT nextval('content_sources_id_seq'::regclass) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100),
    last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

-- Create sequence for content_sources table
CREATE SEQUENCE IF NOT EXISTS content_sources_id_seq;

-- Embeddings storage (for vector search)
CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER NOT NULL DEFAULT nextval('embeddings_id_seq'::regclass) PRIMARY KEY,
    content_id INTEGER,
    embedding_vector VECTOR,
    model_used VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for embeddings table
CREATE SEQUENCE IF NOT EXISTS embeddings_id_seq;

-- JSON content storage
CREATE TABLE IF NOT EXISTS json_content (
    id INTEGER NOT NULL DEFAULT nextval('json_content_id_seq'::regclass) PRIMARY KEY,
    content_type VARCHAR(100),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for json_content table
CREATE SEQUENCE IF NOT EXISTS json_content_id_seq;

-- Professional skills mapping (many-to-many)
CREATE TABLE IF NOT EXISTS professional_skills (
    id INTEGER NOT NULL DEFAULT nextval('professional_skills_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    skill_id INTEGER,
    proficiency_level INTEGER,
    years_experience DECIMAL(3,1),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for professional_skills table
CREATE SEQUENCE IF NOT EXISTS professional_skills_id_seq;

-- Project skills mapping
CREATE TABLE IF NOT EXISTS project_skills (
    id INTEGER NOT NULL DEFAULT nextval('project_skills_id_seq'::regclass) PRIMARY KEY,
    project_id INTEGER,
    skill_name VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for project_skills table
CREATE SEQUENCE IF NOT EXISTS project_skills_id_seq;

-- Search keywords
CREATE TABLE IF NOT EXISTS search_keywords (
    id INTEGER NOT NULL DEFAULT nextval('search_keywords_id_seq'::regclass) PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for search_keywords table
CREATE SEQUENCE IF NOT EXISTS search_keywords_id_seq;

-- Site operations and monitoring
CREATE TABLE IF NOT EXISTS site_operations (
    id INTEGER NOT NULL DEFAULT nextval('site_operations_id_seq'::regclass) PRIMARY KEY,
    operation_type VARCHAR(100),
    status VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for site_operations table
CREATE SEQUENCE IF NOT EXISTS site_operations_id_seq;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_skills_professional_id ON skills(professional_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_skill_name ON skills(skill_name);

CREATE INDEX IF NOT EXISTS idx_projects_professional_id ON projects(professional_id);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

CREATE INDEX IF NOT EXISTS idx_experiences_professional_id ON experiences(professional_id);
CREATE INDEX IF NOT EXISTS idx_experiences_company ON experiences(company);
CREATE INDEX IF NOT EXISTS idx_experiences_position ON experiences(position);

CREATE INDEX IF NOT EXISTS idx_content_chunks_professional_id ON content_chunks(professional_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_chunk_type ON content_chunks(chunk_type);
CREATE INDEX IF NOT EXISTS idx_content_chunks_chunk_id ON content_chunks(chunk_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_vector_id ON content_chunks(vector_id);

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns (only for tables that have updated_at)
CREATE TRIGGER IF NOT EXISTS update_personal_info_updated_at 
    BEFORE UPDATE ON personal_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_content_chunks_updated_at 
    BEFORE UPDATE ON content_chunks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_json_content_updated_at 
    BEFORE UPDATE ON json_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR MCP TOOLS AND ANALYTICS
-- ============================================

-- Comprehensive professional profile view
CREATE OR REPLACE VIEW professional_profile AS
SELECT 
    p.id,
    p.name,
    p.title,
    p.location,
    p.email,
    p.phone,
    p.summary,
    p.bio,
    p.tagline,
    p.highlights,
    p.website,
    p.linkedin,
    p.github,
    p.twitter,
    (SELECT COUNT(*) FROM skills s WHERE s.professional_id = 1) as total_skills,
    (SELECT COUNT(*) FROM projects pr WHERE pr.professional_id = 1) as total_projects,
    (SELECT COUNT(*) FROM experiences e WHERE e.professional_id = 1) as total_experiences
FROM personal_info p;

-- Skills summary view
CREATE OR REPLACE VIEW skills_summary AS
SELECT 
    category,
    COUNT(*) as skill_count,
    ARRAY_AGG(skill_name ORDER BY skill_name) as skills
FROM skills 
WHERE professional_id = 1
GROUP BY category
ORDER BY category;

-- Recent conversation analytics
CREATE OR REPLACE VIEW recent_conversation_stats AS
SELECT 
    DATE(created_at) as conversation_date,
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE status = 'answered') as successful_conversations,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_conversations,
    AVG(response_time_ms)::INTEGER as avg_response_time_ms,
    COUNT(DISTINCT session_id) as unique_sessions
FROM conversations 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY conversation_date DESC;

-- ============================================
-- HELPFUL COMMENTS AND NOTES
-- ============================================

-- This schema represents the ACTUAL WORKING database structure as of September 2025
-- Key differences from the original schema.sql:
-- 1. Uses INTEGER primary keys instead of UUIDs (except personal_info and conversations)
-- 2. Includes professional_id foreign key relationships
-- 3. Has additional business logic fields (outcomes, challenges, impact, etc.)
-- 4. Uses different column names (skill_name vs name, position vs job_title, etc.)
-- 5. Includes comprehensive metadata and search functionality
-- 6. Supports multiple professionals (multi-tenant ready)

-- MCP Tool Dependencies:
-- - lookup_skills: Uses skills table with skill_name, proficiency columns
-- - query_projects: Uses projects table with name, repository_url, demo_url columns  
-- - get_experience_history: Uses experiences table with company, position columns
-- - get_contact_info: Uses personal_info table with name, title, website columns
-- - search_professional_content: Uses content_chunks table with vector search

-- Usage Notes:
-- - This schema is optimized for the existing MCP tools and data structure
-- - All sequences are created to support the INTEGER primary keys
-- - Indexes are optimized for MCP query patterns
-- - Triggers handle timestamp updates automatically
-- - Views provide convenient access for analytics and profiles