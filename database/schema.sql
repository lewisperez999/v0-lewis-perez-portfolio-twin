-- Lewis Perez Portfolio Database Schema - UPDATED TO MATCH WORKING DATABASE
-- PostgreSQL schema for professional portfolio, MCP tools, and conversation logging  
-- Updated September 2025 to reflect actual production database structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE PROFESSIONAL DATA TABLES (MCP COMPATIBLE)
-- ============================================

-- Professional information (single record with UUID primary key)
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

-- Skills and competencies (INTEGER primary key, skill_name column)
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

-- Projects portfolio (INTEGER primary key, name column, repository_url)
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

-- Professional experience (INTEGER primary key, company/position columns)
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

-- Content chunks for vector search (INTEGER primary key, enhanced metadata)
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

-- ============================================
-- CREATE SEQUENCES FOR INTEGER PRIMARY KEYS
-- ============================================

CREATE SEQUENCE IF NOT EXISTS skills_id_seq;
CREATE SEQUENCE IF NOT EXISTS projects_id_seq; 
CREATE SEQUENCE IF NOT EXISTS experiences_id_seq;
CREATE SEQUENCE IF NOT EXISTS content_chunks_id_seq;

-- Main conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255), -- Optional: group conversations by session
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    response_time_ms INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('answered', 'pending', 'failed')),
    model_used VARCHAR(100),
    vector_sources JSONB, -- Store relevant source chunks as JSON
    context_used TEXT, -- RAG context that was provided to the AI
    user_ip VARCHAR(45), -- Optional: for analytics (IPv4/IPv6)
    user_agent TEXT, -- Optional: browser/client info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation metrics for analytics
CREATE TABLE IF NOT EXISTS conversation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_conversations INTEGER DEFAULT 0,
    successful_conversations INTEGER DEFAULT 0,
    failed_conversations INTEGER DEFAULT 0,
    average_response_time_ms INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions (optional for tracking unique users)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_ip VARCHAR(45),
    user_agent TEXT,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE (MCP OPTIMIZED)
-- ============================================

-- Core table indexes optimized for MCP tool queries
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

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_response_time ON conversations(response_time_ms);

-- Content chunks indexes
CREATE INDEX IF NOT EXISTS idx_content_chunks_type ON content_chunks(chunk_type);
CREATE INDEX IF NOT EXISTS idx_content_chunks_created ON content_chunks(created_at);

-- Metrics table indexes
CREATE INDEX IF NOT EXISTS idx_conversation_metrics_date ON conversation_metrics(date DESC);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity DESC);

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

-- Triggers for updated_at columns (only where applicable)
CREATE TRIGGER IF NOT EXISTS update_personal_info_updated_at 
    BEFORE UPDATE ON personal_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_content_chunks_updated_at 
    BEFORE UPDATE ON content_chunks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA FOR TESTING (UPDATED STRUCTURE)
-- ============================================

-- Insert sample content chunks using new structure
INSERT INTO content_chunks (professional_id, chunk_id, title, content, chunk_type, source_file, word_count, search_weight) 
VALUES 
    (1, 'exp_ing_001', 'ING Australia Experience', 'Senior Software Engineer at ING Australia with 3+ years developing enterprise banking solutions using Java, Spring Boot, and microservices architecture. Led performance optimization initiatives reducing API response times from 500ms to 200ms.', 'experience', 'experience.md', 45, 8),
    (1, 'skills_java_001', 'Java/Spring Boot Expertise', 'Expert-level Java development with Spring Boot framework. 8+ years of experience building scalable enterprise applications, RESTful APIs, and microservices. Proficient in Spring Security, Spring Data, and Spring Cloud ecosystem.', 'skills', 'skills.md', 38, 9),
    (1, 'projects_ecom_001', 'E-commerce Platform Project', 'Built comprehensive e-commerce platform using Next.js, Shopify integration, and real-time inventory management. Implemented payment processing, order tracking, and admin dashboard with 99.9% uptime.', 'projects', 'projects.md', 32, 7)
ON CONFLICT (chunk_id) DO NOTHING;

-- Insert sample skills using new structure (skill_name, proficiency)
INSERT INTO skills (professional_id, category, skill_name, proficiency, experience_years, context, skill_type)
VALUES 
    (1, 'Programming Languages', 'Java', 'Expert', '8+ years', 'Enterprise applications, microservices, Spring ecosystem', 'technical'),
    (1, 'Programming Languages', 'JavaScript/TypeScript', 'Advanced', '6+ years', 'Full-stack development, React, Node.js', 'technical'),
    (1, 'Frameworks', 'Spring Boot', 'Expert', '6+ years', 'Microservices architecture, RESTful APIs', 'technical'),
    (1, 'Frameworks', 'React/Next.js', 'Advanced', '4+ years', 'Modern frontend development, SSR/SSG', 'technical'),
    (1, 'Databases', 'PostgreSQL', 'Expert', '7+ years', 'Database design, optimization, complex queries', 'technical'),
    (1, 'Cloud Platforms', 'AWS', 'Intermediate', '5+ years', 'EC2, RDS, Lambda, S3, CloudFormation', 'technical')
ON CONFLICT DO NOTHING;

-- Insert sample projects using new structure (name, repository_url, demo_url)
INSERT INTO projects (professional_id, name, description, technologies, role, repository_url, demo_url)
VALUES 
    (1, 'Banking Microservices Platform', 'Enterprise banking solution with microservices architecture, handling millions of transactions daily with 99.9% uptime', ARRAY['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'AWS'], 'Senior Java Engineer', null, null),
    (1, 'AI Portfolio Chat', 'Interactive portfolio with AI-powered chat using RAG and vector search for professional context', ARRAY['Next.js', 'TypeScript', 'AI SDK', 'PostgreSQL', 'Vector DB'], 'Full Stack Developer', 'https://github.com/lewisperez999/portfolio-v0', 'https://lewisperez.dev'),
    (1, 'E-commerce Platform', 'Full-stack e-commerce solution with Shopify integration and real-time inventory management', ARRAY['Next.js', 'Shopify', 'PostgreSQL', 'Stripe'], 'Full Stack Developer', null, 'https://gintuanatbp.com')
ON CONFLICT DO NOTHING;

-- Insert sample experiences using new structure (company, position)
INSERT INTO experiences (professional_id, company, position, duration, description, achievements, technologies, skills_developed)
VALUES
    (1, 'Freelance', 'Full Stack Developer', 'Mar 2025 – Present', 'Deliver end-to-end e-commerce builds and optimizations using Shopify, Liquid, React/Next.js, and secure payment integrations.', ARRAY['Launched Shopify store with +20% conversion improvement', 'Integrated secure payment processing with 99.9% uptime'], ARRAY['Shopify', 'React', 'Next.js', 'Stripe', 'PayPal'], ARRAY['Client discovery', 'Payment integration', 'Performance optimization']),
    (1, 'ING Business Shared Services', 'Java Engineer', 'Nov 2021 – Oct 2022', 'Designed and optimized Spring Boot microservices for customer onboarding with secure API layers and AES-256 encryption.', ARRAY['Reduced API response time from 500ms to 200ms', 'Mentored 3 junior engineers'], ARRAY['Java', 'Spring Boot', 'PostgreSQL', 'AWS', 'Docker'], ARRAY['Microservices design', 'Performance tuning', 'Mentoring'])
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS FOR EASY DATA ACCESS
-- ============================================

-- View for recent conversation analytics
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

-- View for conversation success rate
CREATE OR REPLACE VIEW conversation_success_rate AS
SELECT 
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE status = 'answered') as successful_conversations,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'answered') * 100.0 / NULLIF(COUNT(*), 0), 2
    ) as success_rate_percentage,
    AVG(response_time_ms)::INTEGER as avg_response_time_ms
FROM conversations 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

-- ============================================
-- HELPFUL COMMENTS AND DOCUMENTATION
-- ============================================

-- This schema has been UPDATED to match the actual working database structure
-- Key changes made to align with production database:
-- 
-- 1. PRIMARY KEYS: Changed to INTEGER with sequences (except personal_info)
-- 2. COLUMN NAMES: Updated to match actual database
--    - skills.name → skills.skill_name
--    - skills.proficiency_level → skills.proficiency (VARCHAR)
--    - projects.github_url → projects.repository_url
--    - experiences.position and experiences.company (kept as-is)
-- 3. ADDITIONAL FIELDS: Added business logic columns
--    - projects: role, outcomes, challenges, documentation_url
--    - experiences: duration, skills_developed, impact, keywords
--    - skills: professional_id, experience_years, context, projects, skill_type
--    - content_chunks: professional_id, importance, search_weight, vector_id
-- 4. INDEXES: Optimized for MCP tool query patterns
-- 5. TRIGGERS: Only for tables with updated_at columns
--
-- MCP Tool Compatibility:
-- ✅ lookup_skills: skill_name, proficiency columns
-- ✅ query_projects: name, repository_url, demo_url columns  
-- ✅ get_experience_history: company, position columns
-- ✅ get_contact_info: name, title, website columns (personal_info)
-- ✅ search_professional_content: content_chunks with vector support
--
-- Usage Notes:
-- - Run this against a fresh database for full schema creation
-- - Existing databases should already have this structure
-- - All MCP tools are now aligned with this schema
-- - Sample data uses the correct column names and structure