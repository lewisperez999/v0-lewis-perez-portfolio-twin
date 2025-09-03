-- Migration Script: Update Portfolio Database Schema
-- This script migrates the existing schema to match the new server actions structure

-- ============================================
-- 1. UPDATE PROJECTS TABLE
-- ============================================

-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS long_description TEXT,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS live_url VARCHAR(500);

-- Copy name to title if title is empty
UPDATE projects SET title = name WHERE title IS NULL OR title = '';

-- Rename demo_url to live_url if live_url is empty  
UPDATE projects SET live_url = demo_url WHERE live_url IS NULL AND demo_url IS NOT NULL;

-- Add featured column if it doesn't exist (it should exist from original schema)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. UPDATE SKILLS TABLE
-- ============================================

-- Add missing columns to skills table
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS proficiency INTEGER,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Convert proficiency_level (1-5) to proficiency (1-100)
UPDATE skills 
SET proficiency = CASE 
    WHEN proficiency_level = 1 THEN 20
    WHEN proficiency_level = 2 THEN 40
    WHEN proficiency_level = 3 THEN 60
    WHEN proficiency_level = 4 THEN 80
    WHEN proficiency_level = 5 THEN 95
    ELSE 60
END
WHERE proficiency IS NULL;

-- ============================================
-- 3. UPDATE EXPERIENCES TABLE
-- ============================================

-- Add missing columns to experiences table
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Location column should already exist from original schema

-- ============================================
-- 4. CREATE PERSONAL_INFO TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS personal_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Add trigger for personal_info
CREATE TRIGGER update_personal_info_updated_at 
    BEFORE UPDATE ON personal_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. UPDATE CONVERSATION LOGGING
-- ============================================

-- Rename conversations table to conversation_logs to match our server actions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_logs') THEN
        ALTER TABLE conversations RENAME TO conversation_logs;
    END IF;
END$$;

-- Add missing columns to conversation_logs if needed
ALTER TABLE conversation_logs 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ============================================
-- 6. ADD INDEXES FOR NEW COLUMNS
-- ============================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_title ON projects(title);
CREATE INDEX IF NOT EXISTS idx_projects_featured_new ON projects(featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status_new ON projects(status, created_at DESC);

-- Skills indexes  
CREATE INDEX IF NOT EXISTS idx_skills_proficiency ON skills(proficiency DESC);
CREATE INDEX IF NOT EXISTS idx_skills_featured_new ON skills(featured DESC, proficiency DESC);
CREATE INDEX IF NOT EXISTS idx_skills_category_new ON skills(category, proficiency DESC);

-- Experiences indexes
CREATE INDEX IF NOT EXISTS idx_experiences_featured_new ON experiences(featured DESC, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_start_date_new ON experiences(start_date DESC);

-- Personal info indexes
CREATE INDEX IF NOT EXISTS idx_personal_info_created_at ON personal_info(created_at DESC);

-- ============================================
-- 7. INSERT DEFAULT DATA
-- ============================================

-- Insert default personal info if none exists
INSERT INTO personal_info (
    name, title, location, email, phone, summary, bio, tagline, highlights,
    website, linkedin, github, twitter
) 
SELECT 
    'Lewis Perez',
    'Senior Software Engineer',
    'Melbourne, Australia',
    'lewis@lewisperez.dev',
    '+61 XXX XXX XXX',
    'Experienced software engineer with 8+ years in enterprise development, specializing in Java, Spring Boot, and AWS cloud solutions. Currently freelancing and pursuing advanced studies in Melbourne.',
    'Senior Software Engineer with 8+ years'' experience building secure, scalable microservices and APIs across banking and telecom, complemented by full‑stack freelancing (React/Next.js/Shopify) in Australia. My strengths lie in Java, Spring Boot, PostgreSQL, and AWS, with proven results including 500ms→200ms latency reductions, +30% throughput gains, and 40% faster data migrations.

I combine enterprise rigor with product speed—optimizing APIs, data flows, and cloud services while coaching teams to deliver. My career journey spans from IBM''s global enterprise systems to ING''s secure banking microservices, and now includes e-commerce optimization for Australian businesses while pursuing advanced studies in cybersecurity and telecommunications.

Focused on cloud‑native architecture, performance optimization, and mentoring, I''m building toward Solutions Architect or Engineering Lead roles. I thrive in feedback-driven environments where I can deliver measurable business impact while fostering team growth and technical excellence.',
    'Enterprise-grade reliability with adaptability and measurable impact',
    ARRAY[
        '8+ years in banking & telecom with secure, scalable systems',
        'Cross-cultural experience from Philippines to Australia', 
        'Mentored juniors, boosted team velocity +15%',
        'Proven track record of optimization and measurable impact'
    ],
    'https://lewisperez.dev',
    'https://linkedin.com/in/lewisperez',
    'https://github.com/lewisperez999',
    null
WHERE NOT EXISTS (SELECT 1 FROM personal_info);

-- Update existing skills to add featured flag for top skills
UPDATE skills 
SET featured = true 
WHERE name IN ('Java', 'Spring Boot', 'PostgreSQL', 'AWS', 'Next.js')
AND featured = false;

-- Update existing projects to add missing data
UPDATE projects 
SET 
    title = COALESCE(title, name),
    long_description = COALESCE(long_description, description || ' - Comprehensive project showcasing technical expertise and problem-solving capabilities.'),
    image_url = COALESCE(image_url, '/placeholder.jpg'),
    live_url = COALESCE(live_url, demo_url)
WHERE title IS NULL OR long_description IS NULL OR image_url IS NULL;

-- Set featured flag for top projects
UPDATE projects 
SET featured = true 
WHERE name IN ('Banking Microservices Platform', 'AI Portfolio Chat')
AND featured = false;

-- ============================================
-- 8. CLEANUP (OPTIONAL)
-- ============================================

-- Note: Uncomment these if you want to remove old columns after migration
-- These are commented out for safety - only run after verifying everything works

-- ALTER TABLE projects DROP COLUMN IF EXISTS name;  -- Only after confirming title is populated
-- ALTER TABLE projects DROP COLUMN IF EXISTS demo_url;  -- Only after confirming live_url is populated
-- ALTER TABLE skills DROP COLUMN IF EXISTS proficiency_level;  -- Only after confirming proficiency is populated

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify the migration worked correctly:

-- Check personal_info table
-- SELECT * FROM personal_info;

-- Check projects table structure
-- SELECT title, long_description, featured, live_url FROM projects LIMIT 3;

-- Check skills table structure  
-- SELECT name, category, proficiency, featured FROM skills LIMIT 5;

-- Check experiences table structure
-- SELECT company, position, location, featured FROM experiences LIMIT 3;

-- Check conversation_logs table
-- SELECT COUNT(*) as conversation_count FROM conversation_logs;

COMMIT;