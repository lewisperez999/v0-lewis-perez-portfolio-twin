-- ================================================================
-- PROFESSIONAL DIGITAL TWIN DATABASE SCHEMA
-- ================================================================
-- Created: 2025-09-02
-- Purpose: Comprehensive schema for professional digital twin application
-- Features: JSONB storage, RAG integration, full-text search, vector support
-- ================================================================

-- ================================================================
-- EXTENSIONS AND TYPES
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Custom ENUM types for better data integrity
CREATE TYPE employment_type AS ENUM (
    'full_time', 'part_time', 'contract', 'freelance', 
    'internship', 'temporary', 'volunteer'
);

CREATE TYPE education_type AS ENUM (
    'bachelor', 'master', 'phd', 'diploma', 'certificate', 
    'bootcamp', 'online_course', 'professional_certification'
);

CREATE TYPE project_status AS ENUM (
    'planning', 'in_progress', 'completed', 'on_hold', 
    'cancelled', 'maintenance'
);

CREATE TYPE proficiency_level AS ENUM (
    'beginner', 'intermediate', 'advanced', 'expert'
);

CREATE TYPE content_source_type AS ENUM (
    'experience', 'project', 'skill', 'education', 
    'achievement', 'summary', 'personal_info'
);

CREATE TYPE interaction_type AS ENUM (
    'chat_message', 'search_query', 'profile_view', 
    'document_generation', 'skill_assessment'
);

-- ================================================================
-- CORE TABLES
-- ================================================================

-- 1. PROFESSIONALS TABLE
-- Main professional profile information
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    title VARCHAR(200),
    
    -- Professional Summary
    summary TEXT,
    elevator_pitch TEXT,
    
    -- Location and Availability
    location VARCHAR(200),
    timezone VARCHAR(50),
    availability VARCHAR(100),
    work_authorization VARCHAR(100),
    
    -- Contact Information
    website_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    phone VARCHAR(20),
    preferred_contact_method VARCHAR(50) DEFAULT 'email',
    
    -- Professional Status
    availability_status VARCHAR(50) DEFAULT 'available',
    hourly_rate DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Preferences and Specializations
    preferred_roles JSONB DEFAULT '[]'::jsonb,
    specializations JSONB DEFAULT '[]'::jsonb,
    
    -- Media Assets
    profile_image_url VARCHAR(500),
    background_image_url VARCHAR(500),
    
    -- Metadata and Search
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector,
    
    -- Status and Audit
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. JSON_CONTENT TABLE
-- Store complete structured data as JSONB
CREATE TABLE json_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- JSON Data Storage
    content_type VARCHAR(50) NOT NULL DEFAULT 'professional_profile',
    json_data JSONB NOT NULL,
    
    -- Version Control
    version VARCHAR(20) NOT NULL,
    data_quality_score INTEGER DEFAULT 0,
    completeness_metrics JSONB DEFAULT '{}'::jsonb,
    
    -- Validation and Processing
    is_validated BOOLEAN DEFAULT false,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    last_processed_at TIMESTAMP WITH TIME ZONE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_professional_content_type UNIQUE (professional_id, content_type)
);

-- 3. CONTENT_CHUNKS TABLE
-- Processed content chunks for RAG system
CREATE TABLE content_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Source Information
    source_type content_source_type NOT NULL,
    source_id UUID, -- References to experiences, projects, etc.
    
    -- Content Data
    chunk_text TEXT NOT NULL,
    chunk_metadata JSONB DEFAULT '{}'::jsonb,
    chunk_order INTEGER DEFAULT 0,
    
    -- Content Analysis
    token_count INTEGER,
    char_count INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    
    -- Search and Relevance
    importance_level VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    search_weight INTEGER DEFAULT 5, -- 1-10 relevance scoring
    tags JSONB DEFAULT '[]'::jsonb,
    related_chunks JSONB DEFAULT '[]'::jsonb,
    
    -- Processing Information
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    search_vector tsvector,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. EXPERIENCES TABLE
-- Professional work experience
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Company and Role Information
    company_name VARCHAR(200) NOT NULL,
    position_title VARCHAR(200) NOT NULL,
    employment_type employment_type NOT NULL,
    
    -- Location and Work Arrangement
    location VARCHAR(200),
    is_remote BOOLEAN DEFAULT false,
    
    -- Duration
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    
    -- Role Description
    description TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    technologies JSONB DEFAULT '[]'::jsonb,
    skills_developed JSONB DEFAULT '[]'::jsonb,
    
    -- Impact and Results
    quantifiable_results JSONB DEFAULT '[]'::jsonb,
    impact_description TEXT,
    
    -- Company Information
    company_website VARCHAR(500),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    
    -- Compensation (optional)
    salary_range VARCHAR(100),
    
    -- Search and Display
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. SKILLS TABLE
-- Skills catalog and definitions
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Skill Definition
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,
    
    -- Skill Classification
    is_technical BOOLEAN DEFAULT true,
    aliases JSONB DEFAULT '[]'::jsonb,
    related_skills JSONB DEFAULT '[]'::jsonb,
    
    -- Market Information
    market_demand INTEGER DEFAULT 0, -- 0-100 scale
    learning_resources JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PROFESSIONAL_SKILLS TABLE
-- Junction table for professional-skill relationships
CREATE TABLE professional_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    
    -- Proficiency Information
    proficiency_level proficiency_level NOT NULL,
    years_of_experience DECIMAL(4,2) DEFAULT 0,
    last_used_date DATE,
    
    -- Validation and Evidence
    is_certified BOOLEAN DEFAULT false,
    certification_details JSONB DEFAULT '{}'::jsonb,
    endorsements INTEGER DEFAULT 0,
    self_assessed BOOLEAN DEFAULT true,
    
    -- Context and Projects
    context_description TEXT,
    projects_used JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    
    -- Display
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_professional_skill UNIQUE (professional_id, skill_id)
);

-- 7. PROJECTS TABLE
-- Portfolio projects and case studies
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Project Basic Information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    project_type VARCHAR(100),
    status project_status DEFAULT 'planning',
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    duration_months DECIMAL(5,2),
    
    -- Project Context
    client_name VARCHAR(200),
    team_size INTEGER,
    my_role VARCHAR(200),
    budget_range VARCHAR(100),
    industry VARCHAR(100),
    
    -- Technical Details
    technologies JSONB DEFAULT '[]'::jsonb,
    challenges_overcome JSONB DEFAULT '[]'::jsonb,
    key_achievements JSONB DEFAULT '[]'::jsonb,
    lessons_learned JSONB DEFAULT '[]'::jsonb,
    
    -- Results and Impact
    outcomes JSONB DEFAULT '[]'::jsonb,
    project_metrics JSONB DEFAULT '{}'::jsonb,
    
    -- Links and Resources
    project_url VARCHAR(500),
    repository_url VARCHAR(500),
    demo_url VARCHAR(500),
    documentation_url VARCHAR(500),
    image_urls JSONB DEFAULT '[]'::jsonb,
    
    -- Search and Display
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector,
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 8. PROJECT_SKILLS TABLE
-- Junction table for project-skill relationships
CREATE TABLE project_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    
    -- Skill Usage in Project
    importance_level INTEGER DEFAULT 1, -- 1-5 scale
    usage_details TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_project_skill UNIQUE (project_id, skill_id)
);

-- 9. EDUCATION TABLE
-- Academic background and learning
CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Institution Information
    institution_name VARCHAR(200) NOT NULL,
    degree_or_certification VARCHAR(200) NOT NULL,
    field_of_study VARCHAR(200),
    education_type education_type NOT NULL,
    
    -- Duration and Completion
    start_date DATE,
    end_date DATE,
    is_completed BOOLEAN DEFAULT false,
    graduation_year INTEGER,
    
    -- Academic Performance
    gpa DECIMAL(4,2),
    grade_scale VARCHAR(20),
    honors_awards JSONB DEFAULT '[]'::jsonb,
    
    -- Location
    location VARCHAR(200),
    
    -- Academic Content
    description TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    relevant_coursework JSONB DEFAULT '[]'::jsonb,
    thesis_project TEXT,
    academic_projects JSONB DEFAULT '[]'::jsonb,
    
    -- Skills and Learning
    skills_acquired JSONB DEFAULT '[]'::jsonb,
    
    -- Verification
    institution_website VARCHAR(500),
    verification_url VARCHAR(500),
    credential_id VARCHAR(200),
    
    -- Search and Display
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 10. EMBEDDINGS TABLE
-- Vector embeddings for AI/ML integration
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_chunk_id UUID NOT NULL REFERENCES content_chunks(id) ON DELETE CASCADE,
    
    -- Embedding Information
    embedding_model VARCHAR(100) NOT NULL,
    embedding_vector vector(1536), -- OpenAI ada-002 dimensions
    embedding_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Processing Information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_chunk_model UNIQUE (content_chunk_id, embedding_model)
);

-- 11. CONTENT_SOURCES TABLE
-- Track content sources for processing
CREATE TABLE content_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Source Information
    source_name VARCHAR(200) NOT NULL,
    source_url VARCHAR(500),
    source_type VARCHAR(100),
    
    -- Processing Status
    last_processed_at TIMESTAMP WITH TIME ZONE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SITE_OPERATIONS TABLE
-- Operational data for the digital twin application
CREATE TABLE site_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Interaction Details
    interaction_type interaction_type NOT NULL,
    session_id VARCHAR(100),
    user_identifier VARCHAR(100), -- Could be IP, user ID, etc.
    
    -- Request Information
    request_data JSONB DEFAULT '{}'::jsonb,
    response_data JSONB DEFAULT '{}'::jsonb,
    
    -- Performance Metrics
    response_time_ms INTEGER,
    tokens_used INTEGER,
    chunks_retrieved INTEGER,
    
    -- Context and Metadata
    user_agent TEXT,
    ip_address INET,
    referer_url VARCHAR(500),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. SEARCH_KEYWORDS TABLE
-- Track search keywords for optimization
CREATE TABLE search_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Keyword Information
    keyword VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    frequency INTEGER DEFAULT 1,
    relevance_score DECIMAL(3,2) DEFAULT 1.0,
    
    -- Context
    source_table VARCHAR(50),
    source_field VARCHAR(50),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_professional_keyword UNIQUE (professional_id, keyword)
);

-- ================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================================================

-- Professionals table indexes
CREATE INDEX idx_professionals_email ON professionals(email);
CREATE INDEX idx_professionals_active ON professionals(is_active, is_public) WHERE deleted_at IS NULL;
CREATE INDEX idx_professionals_location ON professionals(location) WHERE location IS NOT NULL;
CREATE INDEX idx_professionals_search_vector ON professionals USING gin(search_vector);
CREATE INDEX idx_professionals_preferred_roles ON professionals USING gin(preferred_roles);
CREATE INDEX idx_professionals_specializations ON professionals USING gin(specializations);

-- JSON content indexes
CREATE INDEX idx_json_content_professional ON json_content(professional_id, content_type);
CREATE INDEX idx_json_content_version ON json_content(version, created_at);
CREATE INDEX idx_json_content_data ON json_content USING gin(json_data);
CREATE INDEX idx_json_content_quality ON json_content(data_quality_score) WHERE data_quality_score > 0;

-- Content chunks indexes
CREATE INDEX idx_content_chunks_professional ON content_chunks(professional_id, source_type, chunk_order);
CREATE INDEX idx_content_chunks_source ON content_chunks(source_type, source_id);
CREATE INDEX idx_content_chunks_search_vector ON content_chunks USING gin(search_vector);
CREATE INDEX idx_content_chunks_importance ON content_chunks(importance_level, search_weight);
CREATE INDEX idx_content_chunks_tags ON content_chunks USING gin(tags);

-- Experiences indexes
CREATE INDEX idx_experiences_professional_id ON experiences(professional_id, start_date DESC, is_current DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_experiences_company ON experiences(company_name, position_title);
CREATE INDEX idx_experiences_dates ON experiences(start_date, end_date, is_current);
CREATE INDEX idx_experiences_technologies ON experiences USING gin(technologies);
CREATE INDEX idx_experiences_search_vector ON experiences USING gin(search_vector);
CREATE INDEX idx_experiences_featured ON experiences(is_featured, display_order) WHERE is_featured = true;

-- Skills indexes
CREATE INDEX idx_skills_category ON skills(category, subcategory, name);
CREATE INDEX idx_skills_name_search ON skills USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_skills_market_demand ON skills(market_demand DESC, category) WHERE market_demand > 0;
CREATE INDEX idx_skills_aliases ON skills USING gin(aliases);

-- Professional skills indexes
CREATE INDEX idx_professional_skills_professional ON professional_skills(professional_id, proficiency_level, years_of_experience DESC);
CREATE INDEX idx_professional_skills_skill ON professional_skills(skill_id, proficiency_level, years_of_experience DESC);
CREATE INDEX idx_professional_skills_featured ON professional_skills(professional_id, is_featured, display_order) WHERE is_featured = true;

-- Projects indexes
CREATE INDEX idx_projects_professional_id ON projects(professional_id, start_date DESC, is_featured DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status ON projects(status, start_date DESC);
CREATE INDEX idx_projects_public ON projects(is_public, is_featured, start_date DESC) WHERE is_public = true AND deleted_at IS NULL;
CREATE INDEX idx_projects_technologies ON projects USING gin(technologies);
CREATE INDEX idx_projects_search_vector ON projects USING gin(search_vector);

-- Education indexes
CREATE INDEX idx_education_professional_id ON education(professional_id, end_date DESC, is_completed DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_education_institution ON education(institution_name, degree_or_certification);
CREATE INDEX idx_education_type ON education(education_type, graduation_year DESC);
CREATE INDEX idx_education_search_vector ON education USING gin(search_vector);

-- Embeddings indexes
CREATE INDEX idx_embeddings_content_chunk ON embeddings(content_chunk_id, embedding_model);
CREATE INDEX idx_embeddings_vector_cosine ON embeddings USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);

-- Site operations indexes
CREATE INDEX idx_site_operations_professional ON site_operations(professional_id, created_at DESC);
CREATE INDEX idx_site_operations_type ON site_operations(interaction_type, created_at DESC);
CREATE INDEX idx_site_operations_session ON site_operations(session_id, created_at);
CREATE INDEX idx_site_operations_performance ON site_operations(response_time_ms, tokens_used) WHERE response_time_ms IS NOT NULL;

-- Search keywords indexes
CREATE INDEX idx_search_keywords_professional ON search_keywords(professional_id, frequency DESC);
CREATE INDEX idx_search_keywords_keyword ON search_keywords(keyword, relevance_score DESC);
CREATE INDEX idx_search_keywords_category ON search_keywords(category, frequency DESC);

-- ================================================================
-- TRIGGERS FOR AUTOMATED OPERATIONS
-- ================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_json_content_updated_at BEFORE UPDATE ON json_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_chunks_updated_at BEFORE UPDATE ON content_chunks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_skills_updated_at BEFORE UPDATE ON professional_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_sources_updated_at BEFORE UPDATE ON content_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_search_keywords_updated_at BEFORE UPDATE ON search_keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update search vectors
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'professionals' THEN
        NEW.search_vector := to_tsvector('english', 
            COALESCE(NEW.first_name, '') || ' ' ||
            COALESCE(NEW.last_name, '') || ' ' ||
            COALESCE(NEW.title, '') || ' ' ||
            COALESCE(NEW.summary, '') || ' ' ||
            COALESCE(NEW.location, '')
        );
    ELSIF TG_TABLE_NAME = 'content_chunks' THEN
        NEW.search_vector := to_tsvector('english', COALESCE(NEW.chunk_text, ''));
    ELSIF TG_TABLE_NAME = 'experiences' THEN
        NEW.search_vector := to_tsvector('english',
            COALESCE(NEW.company_name, '') || ' ' ||
            COALESCE(NEW.position_title, '') || ' ' ||
            COALESCE(NEW.description, '')
        );
    ELSIF TG_TABLE_NAME = 'projects' THEN
        NEW.search_vector := to_tsvector('english',
            COALESCE(NEW.title, '') || ' ' ||
            COALESCE(NEW.description, '') || ' ' ||
            COALESCE(NEW.detailed_description, '')
        );
    ELSIF TG_TABLE_NAME = 'education' THEN
        NEW.search_vector := to_tsvector('english',
            COALESCE(NEW.institution_name, '') || ' ' ||
            COALESCE(NEW.degree_or_certification, '') || ' ' ||
            COALESCE(NEW.field_of_study, '') || ' ' ||
            COALESCE(NEW.description, '')
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply search vector triggers
CREATE TRIGGER update_professionals_search_vector BEFORE INSERT OR UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_search_vector();
CREATE TRIGGER update_content_chunks_search_vector BEFORE INSERT OR UPDATE ON content_chunks FOR EACH ROW EXECUTE FUNCTION update_search_vector();
CREATE TRIGGER update_experiences_search_vector BEFORE INSERT OR UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION update_search_vector();
CREATE TRIGGER update_projects_search_vector BEFORE INSERT OR UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_search_vector();
CREATE TRIGGER update_education_search_vector BEFORE INSERT OR UPDATE ON education FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ================================================================
-- CONSTRAINTS AND VALIDATION
-- ================================================================

-- Add check constraints for data validation
ALTER TABLE professionals ADD CONSTRAINT chk_professionals_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE professionals ADD CONSTRAINT chk_professionals_hourly_rate CHECK (hourly_rate >= 0);

ALTER TABLE professional_skills ADD CONSTRAINT chk_professional_skills_years CHECK (years_of_experience >= 0 AND years_of_experience <= 50);
ALTER TABLE professional_skills ADD CONSTRAINT chk_professional_skills_endorsements CHECK (endorsements >= 0);

ALTER TABLE projects ADD CONSTRAINT chk_projects_duration CHECK (duration_months >= 0);
ALTER TABLE projects ADD CONSTRAINT chk_projects_team_size CHECK (team_size >= 0);

ALTER TABLE education ADD CONSTRAINT chk_education_gpa CHECK (gpa >= 0 AND gpa <= 5); -- Accommodate different scales
ALTER TABLE education ADD CONSTRAINT chk_education_graduation_year CHECK (graduation_year >= 1900 AND graduation_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 10);

ALTER TABLE content_chunks ADD CONSTRAINT chk_content_chunks_weight CHECK (search_weight >= 1 AND search_weight <= 10);
ALTER TABLE content_chunks ADD CONSTRAINT chk_content_chunks_counts CHECK (token_count >= 0 AND char_count >= 0);

ALTER TABLE json_content ADD CONSTRAINT chk_json_content_quality CHECK (data_quality_score >= 0 AND data_quality_score <= 100);

-- ================================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================================

-- Comprehensive professional profile view
CREATE VIEW professional_profiles AS
SELECT 
    p.*,
    (SELECT COUNT(*) FROM experiences e WHERE e.professional_id = p.id AND e.deleted_at IS NULL) as experience_count,
    (SELECT COUNT(*) FROM projects pr WHERE pr.professional_id = p.id AND pr.deleted_at IS NULL) as project_count,
    (SELECT COUNT(*) FROM professional_skills ps WHERE ps.professional_id = p.id) as skill_count,
    (SELECT COUNT(*) FROM education ed WHERE ed.professional_id = p.id AND ed.deleted_at IS NULL) as education_count,
    (SELECT COUNT(*) FROM content_chunks cc WHERE cc.professional_id = p.id) as content_chunk_count
FROM professionals p
WHERE p.deleted_at IS NULL;

-- Featured content view
CREATE VIEW featured_content AS
SELECT 
    'experience' as content_type,
    e.id,
    e.professional_id,
    e.company_name || ' - ' || e.position_title as title,
    e.description,
    e.is_featured,
    e.display_order,
    e.created_at
FROM experiences e
WHERE e.is_featured = true AND e.deleted_at IS NULL
UNION ALL
SELECT 
    'project' as content_type,
    p.id,
    p.professional_id,
    p.title,
    p.description,
    p.is_featured,
    p.display_order,
    p.created_at
FROM projects p
WHERE p.is_featured = true AND p.deleted_at IS NULL
UNION ALL
SELECT 
    'education' as content_type,
    ed.id,
    ed.professional_id,
    ed.institution_name || ' - ' || ed.degree_or_certification as title,
    ed.description,
    ed.is_featured,
    ed.display_order,
    ed.created_at
FROM education ed
WHERE ed.is_featured = true AND ed.deleted_at IS NULL
ORDER BY display_order, created_at DESC;

-- Skills summary view
CREATE VIEW skills_summary AS
SELECT 
    p.id as professional_id,
    s.category,
    COUNT(*) as skill_count,
    AVG(ps.years_of_experience) as avg_experience,
    ARRAY_AGG(s.name ORDER BY ps.years_of_experience DESC) as skills
FROM professionals p
JOIN professional_skills ps ON p.id = ps.professional_id
JOIN skills s ON ps.skill_id = s.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, s.category;

-- ================================================================
-- SCHEMA INFORMATION AND COMMENTS
-- ================================================================

-- Add table comments for documentation
COMMENT ON TABLE professionals IS 'Main professional profiles and contact information';
COMMENT ON TABLE json_content IS 'Complete structured data storage using JSONB for flexible queries';
COMMENT ON TABLE content_chunks IS 'Processed content chunks optimized for RAG system integration';
COMMENT ON TABLE experiences IS 'Professional work experience with detailed achievements and metrics';
COMMENT ON TABLE skills IS 'Master skills catalog with categorization and market information';
COMMENT ON TABLE professional_skills IS 'Junction table linking professionals to skills with proficiency data';
COMMENT ON TABLE projects IS 'Portfolio projects and case studies with technical details';
COMMENT ON TABLE education IS 'Academic background and professional learning records';
COMMENT ON TABLE embeddings IS 'Vector embeddings for AI/ML integration and semantic search';
COMMENT ON TABLE site_operations IS 'Operational analytics and user interaction tracking';

-- Add column comments for key fields
COMMENT ON COLUMN content_chunks.search_weight IS 'Relevance weight 1-10 for ranking search results';
COMMENT ON COLUMN content_chunks.importance_level IS 'Content importance: critical, high, medium, low';
COMMENT ON COLUMN embeddings.embedding_vector IS 'Vector embedding for semantic similarity search';
COMMENT ON COLUMN professionals.search_vector IS 'Full-text search vector for profile content';

-- ================================================================
-- END OF SCHEMA DEFINITION
-- ================================================================