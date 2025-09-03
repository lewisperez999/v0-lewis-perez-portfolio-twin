-- Lewis Perez Portfolio Database Schema
-- PostgreSQL schema for professional portfolio and conversation logging

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Professional content and data tables
-- (These may already exist, but included for completeness)

-- Content chunks for vector search
CREATE TABLE IF NOT EXISTS content_chunks (
    chunk_id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500),
    content TEXT NOT NULL,
    chunk_type VARCHAR(100),
    source_file VARCHAR(255),
    word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional experience data
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    technologies TEXT[],
    achievements TEXT[],
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills and technologies
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    years_experience DECIMAL(3,1),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects portfolio
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    technologies TEXT[],
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'completed',
    start_date DATE,
    end_date DATE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONVERSATION LOGGING TABLES (NEW)
-- ============================================

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
-- INDEXES FOR PERFORMANCE
-- ============================================

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

-- Triggers for updated_at columns
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_chunks_updated_at 
    BEFORE UPDATE ON content_chunks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at 
    BEFORE UPDATE ON experiences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at 
    BEFORE UPDATE ON skills 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample content chunks if they don't exist
INSERT INTO content_chunks (chunk_id, title, content, chunk_type, source_file, word_count) 
VALUES 
    ('exp_ing_001', 'ING Australia Experience', 'Senior Software Engineer at ING Australia with 3+ years developing enterprise banking solutions using Java, Spring Boot, and microservices architecture. Led performance optimization initiatives reducing API response times from 500ms to 200ms.', 'experience', 'experience.md', 45),
    ('skills_java_001', 'Java/Spring Boot Expertise', 'Expert-level Java development with Spring Boot framework. 8+ years of experience building scalable enterprise applications, RESTful APIs, and microservices. Proficient in Spring Security, Spring Data, and Spring Cloud ecosystem.', 'skills', 'skills.md', 38),
    ('projects_ecom_001', 'E-commerce Platform Project', 'Built comprehensive e-commerce platform using Next.js, Shopify integration, and real-time inventory management. Implemented payment processing, order tracking, and admin dashboard with 99.9% uptime.', 'projects', 'projects.md', 32)
ON CONFLICT (chunk_id) DO NOTHING;

-- Insert sample skills if they don't exist
INSERT INTO skills (name, category, proficiency_level, years_experience, description)
VALUES 
    ('Java', 'Programming Languages', 5, 8.0, 'Expert in Java development, enterprise applications, and JVM optimization'),
    ('Spring Boot', 'Frameworks', 5, 6.0, 'Advanced Spring Boot development for microservices and web applications'),
    ('PostgreSQL', 'Databases', 4, 5.0, 'Database design, optimization, and advanced querying'),
    ('AWS', 'Cloud Platforms', 4, 4.0, 'EC2, RDS, Lambda, S3, and various AWS services'),
    ('Next.js', 'Frontend Frameworks', 4, 2.0, 'Modern React framework for full-stack applications')
ON CONFLICT (name) DO NOTHING;

-- Insert sample projects if they don't exist
INSERT INTO projects (name, description, technologies, github_url, demo_url, status, featured)
VALUES 
    ('Banking Microservices Platform', 'Enterprise banking solution with microservices architecture, handling millions of transactions daily with 99.9% uptime', ARRAY['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'AWS'], 'https://github.com/private-repo', null, 'completed', true),
    ('AI Portfolio Chat', 'Interactive portfolio with AI-powered chat using RAG and vector search for professional context', ARRAY['Next.js', 'TypeScript', 'AI SDK', 'PostgreSQL', 'Vector DB'], 'https://github.com/current-repo', 'https://portfolio.lewisperez.dev', 'in-progress', true),
    ('E-commerce Platform', 'Full-stack e-commerce solution with Shopify integration and real-time inventory management', ARRAY['Next.js', 'Shopify', 'PostgreSQL', 'Stripe'], 'https://github.com/ecommerce-repo', 'https://demo-store.example.com', 'completed', false)
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
-- HELPFUL COMMENTS
-- ============================================

-- This schema provides:
-- 1. Professional portfolio data structure
-- 2. Comprehensive conversation logging
-- 3. Performance analytics and metrics
-- 4. Proper indexing for fast queries
-- 5. Automated timestamp management
-- 6. Data integrity constraints
-- 7. Sample data for testing
-- 8. Useful views for dashboard queries

-- Usage Notes:
-- - Run this script against your PostgreSQL database
-- - Make sure to set proper environment variables
-- - Consider adding backup and archival strategies for conversation data
-- - Monitor query performance and adjust indexes as needed
-- - Regularly clean up old conversation data based on retention policy