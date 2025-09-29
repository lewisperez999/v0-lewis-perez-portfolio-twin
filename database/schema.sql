-- Lewis Perez Portfolio Database Schema - EXTRACTED FROM LIVE DATABASE
-- PostgreSQL schema extracted on 2025-09-25T07:05:51.941Z
-- This represents the ACTUAL current database structure

-- ============================================
-- REQUIRED EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- SEQUENCES
-- ============================================

CREATE SEQUENCE IF NOT EXISTS content_chunks_id_seq;
CREATE SEQUENCE IF NOT EXISTS education_id_seq;
CREATE SEQUENCE IF NOT EXISTS experiences_id_seq;
CREATE SEQUENCE IF NOT EXISTS json_content_id_seq;
CREATE SEQUENCE IF NOT EXISTS professionals_id_seq;
CREATE SEQUENCE IF NOT EXISTS projects_id_seq;
CREATE SEQUENCE IF NOT EXISTS skills_id_seq;

-- ============================================
-- TABLES
-- ============================================

-- ai_chat_sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    session_id CHARACTER VARYING(255) NOT NULL PRIMARY KEY,
    conversation_type CHARACTER VARYING(50) NOT NULL,
    persona CHARACTER VARYING(50),
    ai_model CHARACTER VARYING(100) DEFAULT 'openai/gpt-4o-mini'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    CHECK session_id IS NOT NULL,
    CHECK conversation_type IS NOT NULL,
    CHECK ((conversation_type)::text = ANY ((ARRAY['interview'::character varying, 'assessment'::character varying, 'exploration'::character varying, 'analysis'::character varying])::text[])),
    CHECK ((persona)::text = ANY ((ARRAY['interviewer'::character varying, 'technical_assessor'::character varying, 'curious_explorer'::character varying, 'analyst'::character varying])::text[]))
);

-- ai_conversation_analytics
CREATE TABLE IF NOT EXISTS ai_conversation_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id CHARACTER VARYING(255),
    conversation_turn INTEGER NOT NULL,
    question_type CHARACTER VARYING(100),
    response_quality_score NUMERIC,
    technical_depth_score NUMERIC,
    topics_mentioned text[],
    technologies_discussed text[],
    sources_utilized JSONB DEFAULT '[]'::jsonb,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK id IS NOT NULL,
    CHECK conversation_turn IS NOT NULL,
    CHECK ((response_quality_score >= (0)::numeric) AND (response_quality_score <= (1)::numeric)),
    CHECK ((technical_depth_score >= (0)::numeric) AND (technical_depth_score <= (1)::numeric))
);

-- backup_records
CREATE TABLE IF NOT EXISTS backup_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_name CHARACTER VARYING(255),
    backup_type CHARACTER VARYING(50) NOT NULL,
    storage_location CHARACTER VARYING(50) DEFAULT 'local'::character varying,
    file_path CHARACTER VARYING(500),
    file_size_bytes BIGINT,
    compression BOOLEAN DEFAULT true,
    encryption BOOLEAN DEFAULT false,
    retention_days INTEGER DEFAULT 30,
    status CHARACTER VARYING(50) DEFAULT 'completed'::character varying,
    checksum CHARACTER VARYING(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by CHARACTER VARYING(255) DEFAULT 'mcp_tool'::character varying,
    CHECK id IS NOT NULL,
    CHECK backup_type IS NOT NULL,
    CHECK ((backup_type)::text = ANY ((ARRAY['full'::character varying, 'incremental'::character varying, 'database_only'::character varying, 'embeddings_only'::character varying, 'config_only'::character varying])::text[])),
    CHECK ((retention_days >= 1) AND (retention_days <= 365)),
    CHECK ((status)::text = ANY ((ARRAY['creating'::character varying, 'completed'::character varying, 'failed'::character varying, 'expired'::character varying])::text[])),
    CHECK ((storage_location)::text = ANY ((ARRAY['local'::character varying, 's3'::character varying, 'azure'::character varying, 'gcp'::character varying])::text[]))
);

-- contact_submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name CHARACTER VARYING(100) NOT NULL,
    email CHARACTER VARYING(255) NOT NULL,
    phone CHARACTER VARYING(20),
    company CHARACTER VARYING(100),
    subject CHARACTER VARYING(200) NOT NULL,
    message TEXT NOT NULL,
    inquiry_type CHARACTER VARYING(50) DEFAULT 'other'::character varying,
    urgency CHARACTER VARYING(20) DEFAULT 'medium'::character varying,
    preferred_contact CHARACTER VARYING(20) DEFAULT 'email'::character varying,
    status CHARACTER VARYING(50) DEFAULT 'pending'::character varying,
    ip_address CHARACTER VARYING(45),
    user_agent TEXT,
    captcha_token CHARACTER VARYING(255),
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    responded_at TIMESTAMP WITHOUT TIME ZONE,
    response_notes TEXT,
    CHECK id IS NOT NULL,
    CHECK name IS NOT NULL,
    CHECK email IS NOT NULL,
    CHECK subject IS NOT NULL,
    CHECK message IS NOT NULL,
    CHECK ((inquiry_type)::text = ANY ((ARRAY['job_opportunity'::character varying, 'collaboration'::character varying, 'consultation'::character varying, 'other'::character varying])::text[])),
    CHECK ((preferred_contact)::text = ANY ((ARRAY['email'::character varying, 'phone'::character varying, 'both'::character varying])::text[])),
    CHECK ((status)::text = ANY ((ARRAY['pending'::character varying, 'reviewed'::character varying, 'responded'::character varying, 'archived'::character varying])::text[])),
    CHECK ((urgency)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))
);

-- content_chunks
CREATE TABLE IF NOT EXISTS content_chunks (
    id INTEGER NOT NULL DEFAULT nextval('content_chunks_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    chunk_id CHARACTER VARYING(255) NOT NULL,
    content TEXT NOT NULL,
    chunk_type CHARACTER VARYING(100),
    title CHARACTER VARYING(500),
    metadata JSONB,
    importance CHARACTER VARYING(20),
    date_range CHARACTER VARYING(50),
    search_weight INTEGER DEFAULT 5,
    vector_id CHARACTER VARYING(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_file CHARACTER VARYING(255),
    word_count INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    model_used CHARACTER VARYING(100),
    CHECK id IS NOT NULL,
    CHECK chunk_id IS NOT NULL,
    CHECK content IS NOT NULL
);

-- content_sources
CREATE TABLE IF NOT EXISTS content_sources (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    professional_id UUID NOT NULL,
    source_name CHARACTER VARYING(200) NOT NULL,
    source_url CHARACTER VARYING(500),
    source_type CHARACTER VARYING(100),
    last_processed_at TIMESTAMP WITH TIME ZONE,
    processing_status CHARACTER VARYING(50) DEFAULT 'pending'::character varying,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK professional_id IS NOT NULL,
    CHECK source_name IS NOT NULL
);

-- conversation_comparisons
CREATE TABLE IF NOT EXISTS conversation_comparisons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_a CHARACTER VARYING(255),
    session_b CHARACTER VARYING(255),
    comparison_type CHARACTER VARYING(50) NOT NULL,
    quality_difference NUMERIC,
    engagement_score NUMERIC,
    insights JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK id IS NOT NULL,
    CHECK comparison_type IS NOT NULL,
    CHECK ((session_a)::text <> (session_b)::text)
);

-- conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id CHARACTER VARYING(255),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    response_time_ms INTEGER,
    status CHARACTER VARYING(20) NOT NULL,
    model_used CHARACTER VARYING(100),
    vector_sources JSONB,
    context_used TEXT,
    user_ip CHARACTER VARYING(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK id IS NOT NULL,
    CHECK user_message IS NOT NULL,
    CHECK ai_response IS NOT NULL,
    CHECK status IS NOT NULL,
    CHECK ((status)::text = ANY ((ARRAY['answered'::character varying, 'pending'::character varying, 'failed'::character varying])::text[]))
);

-- education
CREATE TABLE IF NOT EXISTS education (
    id INTEGER NOT NULL DEFAULT nextval('education_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    institution CHARACTER VARYING(255) NOT NULL,
    degree CHARACTER VARYING(255),
    field CHARACTER VARYING(255),
    graduation_year INTEGER,
    achievements text[],
    relevant_coursework text[],
    projects text[],
    gpa CHARACTER VARYING(10),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK institution IS NOT NULL
);

-- embeddings
-- Vector embeddings for AI/ML integration and semantic search
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_chunk_id UUID NOT NULL,
    embedding_model CHARACTER VARYING(100) NOT NULL,
    embedding_vector vector,
    embedding_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK content_chunk_id IS NOT NULL,
    CHECK embedding_model IS NOT NULL
);

-- experiences
CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER NOT NULL DEFAULT nextval('experiences_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    company CHARACTER VARYING(255) NOT NULL,
    position CHARACTER VARYING(255) NOT NULL,
    duration CHARACTER VARYING(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    achievements text[],
    technologies text[],
    skills_developed text[],
    impact TEXT,
    keywords text[],
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK company IS NOT NULL,
    CHECK position IS NOT NULL
);

-- json_content
CREATE TABLE IF NOT EXISTS json_content (
    id INTEGER NOT NULL DEFAULT nextval('json_content_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    content_type CHARACTER VARYING(50) DEFAULT 'portfolio'::character varying,
    json_data JSONB NOT NULL,
    version CHARACTER VARYING(20),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK json_data IS NOT NULL
);

-- personal_info
CREATE TABLE IF NOT EXISTS personal_info (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    title CHARACTER VARYING(255) NOT NULL,
    location CHARACTER VARYING(255),
    email CHARACTER VARYING(255),
    phone CHARACTER VARYING(50),
    summary TEXT,
    bio TEXT,
    tagline TEXT,
    highlights text[],
    website CHARACTER VARYING(500),
    linkedin CHARACTER VARYING(500),
    github CHARACTER VARYING(500),
    twitter CHARACTER VARYING(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK id IS NOT NULL,
    CHECK name IS NOT NULL,
    CHECK title IS NOT NULL
);

-- professional_skills
-- Junction table linking professionals to skills with proficiency data
CREATE TABLE IF NOT EXISTS professional_skills (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    professional_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    proficiency_level skill_proficiency NOT NULL,
    years_of_experience NUMERIC DEFAULT 0,
    last_used_date DATE,
    is_certified BOOLEAN DEFAULT false,
    certification_details JSONB DEFAULT '{}'::jsonb,
    endorsements INTEGER DEFAULT 0,
    self_assessed BOOLEAN DEFAULT true,
    notes TEXT,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    context_description TEXT,
    projects_used JSONB DEFAULT '[]'::jsonb,
    CHECK id IS NOT NULL,
    CHECK professional_id IS NOT NULL,
    CHECK skill_id IS NOT NULL,
    CHECK proficiency_level IS NOT NULL,
    CHECK (endorsements >= 0),
    CHECK ((years_of_experience >= (0)::numeric) AND (years_of_experience <= (50)::numeric))
);

-- professionals
CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER NOT NULL DEFAULT nextval('professionals_id_seq'::regclass) PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    title CHARACTER VARYING(255),
    location CHARACTER VARYING(255),
    email CHARACTER VARYING(255),
    linkedin CHARACTER VARYING(500),
    portfolio CHARACTER VARYING(500),
    github CHARACTER VARYING(500),
    summary TEXT,
    elevator_pitch TEXT,
    availability CHARACTER VARYING(255),
    work_authorization CHARACTER VARYING(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK name IS NOT NULL
);

-- project_skills
CREATE TABLE IF NOT EXISTS project_skills (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    importance_level INTEGER DEFAULT 1,
    usage_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK project_id IS NOT NULL,
    CHECK skill_id IS NOT NULL,
    CHECK ((importance_level >= 1) AND (importance_level <= 5))
);

-- projects
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER NOT NULL DEFAULT nextval('projects_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    name CHARACTER VARYING(255) NOT NULL,
    description TEXT,
    technologies text[],
    role CHARACTER VARYING(255),
    outcomes text[],
    challenges text[],
    demo_url CHARACTER VARYING(500),
    repository_url CHARACTER VARYING(500),
    documentation_url CHARACTER VARYING(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date DATE,
    CHECK id IS NOT NULL,
    CHECK name IS NOT NULL
);

-- search_keywords
CREATE TABLE IF NOT EXISTS search_keywords (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    professional_id UUID NOT NULL,
    keyword CHARACTER VARYING(200) NOT NULL,
    category CHARACTER VARYING(100),
    frequency INTEGER DEFAULT 1,
    relevance_score NUMERIC DEFAULT 1.0,
    source_table CHARACTER VARYING(50),
    source_field CHARACTER VARYING(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK professional_id IS NOT NULL,
    CHECK keyword IS NOT NULL
);

-- site_operations
CREATE TABLE IF NOT EXISTS site_operations (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    professional_id UUID,
    interaction_type interaction_type NOT NULL,
    session_id CHARACTER VARYING(100),
    user_identifier CHARACTER VARYING(100),
    request_data JSONB DEFAULT '{}'::jsonb,
    response_data JSONB DEFAULT '{}'::jsonb,
    response_time_ms INTEGER,
    tokens_used INTEGER,
    chunks_retrieved INTEGER,
    user_agent TEXT,
    ip_address INET,
    referer_url CHARACTER VARYING(500),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK interaction_type IS NOT NULL
);

-- skills
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER NOT NULL DEFAULT nextval('skills_id_seq'::regclass) PRIMARY KEY,
    professional_id INTEGER,
    category CHARACTER VARYING(255),
    skill_name CHARACTER VARYING(255) NOT NULL,
    proficiency CHARACTER VARYING(50),
    experience_years CHARACTER VARYING(20),
    context TEXT,
    projects text[],
    skill_type CHARACTER VARYING(50) DEFAULT 'technical'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK id IS NOT NULL,
    CHECK skill_name IS NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_ai_chat_sessions_active ON public.ai_chat_sessions USING btree (is_active, last_activity DESC);
CREATE INDEX idx_ai_chat_sessions_persona ON public.ai_chat_sessions USING btree (persona, last_activity DESC);
CREATE INDEX idx_ai_chat_sessions_type ON public.ai_chat_sessions USING btree (conversation_type, created_at DESC);
CREATE INDEX idx_ai_analytics_scores ON public.ai_conversation_analytics USING btree (response_quality_score DESC, technical_depth_score DESC);
CREATE INDEX idx_ai_analytics_session ON public.ai_conversation_analytics USING btree (session_id, conversation_turn);
CREATE INDEX idx_ai_analytics_tech ON public.ai_conversation_analytics USING gin (technologies_discussed);
CREATE INDEX idx_ai_analytics_topics ON public.ai_conversation_analytics USING gin (topics_mentioned);
CREATE UNIQUE INDEX content_chunks_chunk_id_key ON public.content_chunks USING btree (chunk_id);
CREATE INDEX idx_content_chunks_created ON public.content_chunks USING btree (created_at);
CREATE INDEX idx_content_chunks_importance ON public.content_chunks USING btree (importance);
CREATE INDEX idx_content_chunks_professional ON public.content_chunks USING btree (professional_id);
CREATE INDEX idx_content_chunks_type ON public.content_chunks USING btree (chunk_type);
CREATE INDEX idx_conversation_comparisons_type ON public.conversation_comparisons USING btree (comparison_type, created_at DESC);
CREATE INDEX idx_conversations_created_at ON public.conversations USING btree (created_at DESC);
CREATE INDEX idx_conversations_session_id ON public.conversations USING btree (session_id);
CREATE INDEX idx_conversations_status ON public.conversations USING btree (status);
CREATE INDEX idx_education_professional ON public.education USING btree (professional_id);
CREATE UNIQUE INDEX embeddings_content_chunk_id_embedding_model_key ON public.embeddings USING btree (content_chunk_id, embedding_model);
CREATE INDEX idx_embeddings_content_chunk ON public.embeddings USING btree (content_chunk_id, embedding_model);
CREATE INDEX idx_embeddings_vector_cosine ON public.embeddings USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists='100');
CREATE INDEX idx_experiences_professional ON public.experiences USING btree (professional_id);
CREATE INDEX idx_experiences_start_date ON public.experiences USING btree (start_date DESC);
CREATE INDEX idx_json_content_professional ON public.json_content USING btree (professional_id);
CREATE INDEX idx_personal_info_created_at ON public.personal_info USING btree (created_at DESC);
CREATE INDEX idx_professional_skills_featured ON public.professional_skills USING btree (professional_id, is_featured, display_order) WHERE (is_featured = true);
CREATE INDEX idx_professional_skills_professional ON public.professional_skills USING btree (professional_id, proficiency_level, years_of_experience DESC);
CREATE INDEX idx_professional_skills_skill ON public.professional_skills USING btree (skill_id, proficiency_level, years_of_experience DESC);
CREATE UNIQUE INDEX professional_skills_professional_id_skill_id_key ON public.professional_skills USING btree (professional_id, skill_id);
CREATE UNIQUE INDEX project_skills_project_id_skill_id_key ON public.project_skills USING btree (project_id, skill_id);
CREATE INDEX idx_projects_professional ON public.projects USING btree (professional_id);
CREATE INDEX idx_search_keywords_professional ON public.search_keywords USING btree (professional_id, frequency DESC);
CREATE UNIQUE INDEX unique_professional_keyword ON public.search_keywords USING btree (professional_id, keyword);
CREATE INDEX idx_site_operations_professional ON public.site_operations USING btree (professional_id, created_at DESC);
CREATE INDEX idx_skills_category ON public.skills USING btree (category, proficiency DESC);
CREATE INDEX idx_skills_professional ON public.skills USING btree (professional_id);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.array_to_halfvec(double precision[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(numeric[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(real[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(integer[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(numeric[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(double precision[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(real[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(integer[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_vector(numeric[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.array_to_vector(double precision[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.array_to_vector(real[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.array_to_vector(integer[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.binary_quantize(halfvec)
 RETURNS bit
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_binary_quantize$function$
;

CREATE OR REPLACE FUNCTION public.binary_quantize(vector)
 RETURNS bit
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$binary_quantize$function$
;

CREATE OR REPLACE FUNCTION public.cosine_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_cosine_distance$function$
;

CREATE OR REPLACE FUNCTION public.cosine_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_cosine_distance$function$
;

CREATE OR REPLACE FUNCTION public.cosine_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$cosine_distance$function$
;

CREATE OR REPLACE FUNCTION public.get_professional_profile(professional_email character varying)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'professional', json_build_object(
            'id', p.id,
            'email', p.email,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'display_name', p.display_name,
            'title', p.title,
            'summary', p.summary,
            'location', p.location,
            'website_url', p.website_url,
            'linkedin_url', p.linkedin_url,
            'github_url', p.github_url,
            'profile_image_url', p.profile_image_url,
            'created_at', p.created_at,
            'updated_at', p.updated_at
        ),
        'skills', COALESCE(skills_data, '[]'::json),
        'experiences', COALESCE(experiences_data, '[]'::json),
        'projects', COALESCE(projects_data, '[]'::json)
    ) INTO result
    FROM professionals p
    LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
            'skill_name', s.name,
            'category', s.category,
            'subcategory', s.subcategory,
            'proficiency', ps.proficiency_level,
            'years_experience', ps.years_of_experience,
            'last_used_date', ps.last_used_date,
            'is_featured', ps.is_featured
        )) AS skills_data
        FROM professional_skills ps
        JOIN skills s ON ps.skill_id = s.id
        WHERE ps.professional_id = p.id
    ) skills ON true
    LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
            'id', e.id,
            'company_name', e.company_name,
            'position_title', e.position_title,
            'employment_type', e.employment_type,
            'start_date', e.start_date,
            'end_date', e.end_date,
            'is_current', e.is_current,
            'description', e.description,
            'achievements', e.achievements,
            'technologies', e.technologies,
            'is_featured', e.is_featured
        ) ORDER BY e.start_date DESC) AS experiences_data
        FROM experiences e
        WHERE e.professional_id = p.id AND e.deleted_at IS NULL
    ) experiences ON true
    LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
            'id', pr.id,
            'title', pr.title,
            'description', pr.description,
            'project_type', pr.project_type,
            'status', pr.status,
            'start_date', pr.start_date,
            'end_date', pr.end_date,
            'my_role', pr.my_role,
            'project_url', pr.project_url,
            'repository_url', pr.repository_url,
            'technologies', pr.technologies,
            'key_achievements', pr.key_achievements,
            'is_featured', pr.is_featured
        ) ORDER BY pr.start_date DESC) AS projects_data
        FROM projects pr
        WHERE pr.professional_id = p.id AND pr.deleted_at IS NULL AND pr.is_public = true
    ) projects ON true
    WHERE p.email = professional_email AND p.deleted_at IS NULL;
    
    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_query_trgm$function$
;

CREATE OR REPLACE FUNCTION public.gin_extract_value_trgm(text, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_value_trgm$function$
;

CREATE OR REPLACE FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_consistent$function$
;

CREATE OR REPLACE FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_triconsistent$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_compress$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_consistent$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_decompress$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_distance$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_in(cstring)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_in$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_options(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/pg_trgm', $function$gtrgm_options$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_out(gtrgm)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_out$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_penalty$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_picksplit$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_same$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_union(internal, internal)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_union$function$
;

CREATE OR REPLACE FUNCTION public.halfvec(halfvec, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_accum(double precision[], halfvec)
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_accum$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_add(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_add$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_avg(double precision[])
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_avg$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_cmp(halfvec, halfvec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_cmp$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_combine(double precision[], double precision[])
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_combine$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_concat(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_concat$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_eq(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_eq$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_ge(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_ge$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_gt(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_gt$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_in(cstring, oid, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_in$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_l2_squared_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l2_squared_distance$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_le(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_le$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_lt(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_lt$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_mul(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_mul$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_ne(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_ne$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_negative_inner_product(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_negative_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_out(halfvec)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_out$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_recv(internal, oid, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_recv$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_send(halfvec)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_send$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_spherical_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_spherical_distance$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_sub(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_sub$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_to_float4(halfvec, integer, boolean)
 RETURNS real[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_to_float4$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_to_sparsevec(halfvec, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_to_vector(halfvec, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_typmod_in$function$
;

CREATE OR REPLACE FUNCTION public.hamming_distance(bit, bit)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$hamming_distance$function$
;

CREATE OR REPLACE FUNCTION public.hnsw_bit_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$hnsw_bit_support$function$
;

CREATE OR REPLACE FUNCTION public.hnsw_halfvec_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$hnsw_halfvec_support$function$
;

CREATE OR REPLACE FUNCTION public.hnsw_sparsevec_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$hnsw_sparsevec_support$function$
;

CREATE OR REPLACE FUNCTION public.hnswhandler(internal)
 RETURNS index_am_handler
 LANGUAGE c
AS '$libdir/vector', $function$hnswhandler$function$
;

CREATE OR REPLACE FUNCTION public.inner_product(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.inner_product(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$inner_product$function$
;

CREATE OR REPLACE FUNCTION public.inner_product(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.ivfflat_bit_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$ivfflat_bit_support$function$
;

CREATE OR REPLACE FUNCTION public.ivfflat_halfvec_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$ivfflat_halfvec_support$function$
;

CREATE OR REPLACE FUNCTION public.ivfflathandler(internal)
 RETURNS index_am_handler
 LANGUAGE c
AS '$libdir/vector', $function$ivfflathandler$function$
;

CREATE OR REPLACE FUNCTION public.jaccard_distance(bit, bit)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$jaccard_distance$function$
;

CREATE OR REPLACE FUNCTION public.l1_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$l1_distance$function$
;

CREATE OR REPLACE FUNCTION public.l1_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l1_distance$function$
;

CREATE OR REPLACE FUNCTION public.l1_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l1_distance$function$
;

CREATE OR REPLACE FUNCTION public.l2_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l2_distance$function$
;

CREATE OR REPLACE FUNCTION public.l2_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$l2_distance$function$
;

CREATE OR REPLACE FUNCTION public.l2_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l2_distance$function$
;

CREATE OR REPLACE FUNCTION public.l2_norm(halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l2_norm$function$
;

CREATE OR REPLACE FUNCTION public.l2_norm(sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l2_norm$function$
;

CREATE OR REPLACE FUNCTION public.l2_normalize(vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$l2_normalize$function$
;

CREATE OR REPLACE FUNCTION public.l2_normalize(halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l2_normalize$function$
;

CREATE OR REPLACE FUNCTION public.l2_normalize(sparsevec)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l2_normalize$function$
;

CREATE OR REPLACE FUNCTION public.search_professionals(search_query text DEFAULT NULL::text, skills_filter text[] DEFAULT NULL::text[], location_filter text DEFAULT NULL::text, limit_count integer DEFAULT 20, offset_count integer DEFAULT 0)
 RETURNS TABLE(professional_id uuid, full_name text, title character varying, location character varying, summary text, matching_skills text[], profile_image_url character varying, relevance_score real)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.first_name || ' ' || p.last_name,
        p.title,
        p.location,
        p.summary,
        COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name = ANY(skills_filter)), ARRAY[]::TEXT[]),
        p.profile_image_url,
        CASE 
            WHEN search_query IS NOT NULL THEN ts_rank(p.search_vector, plainto_tsquery('english', search_query))
            ELSE 1.0
        END
    FROM professionals p
    LEFT JOIN professional_skills ps ON p.id = ps.professional_id
    LEFT JOIN skills s ON ps.skill_id = s.id
    WHERE p.is_active = true 
        AND p.is_public = true 
        AND p.deleted_at IS NULL
        AND (search_query IS NULL OR p.search_vector @@ plainto_tsquery('english', search_query))
        AND (location_filter IS NULL OR p.location ILIKE '%' || location_filter || '%')
        AND (skills_filter IS NULL OR EXISTS (
            SELECT 1 FROM professional_skills ps2 
            JOIN skills s2 ON ps2.skill_id = s2.id
            WHERE ps2.professional_id = p.id 
                AND s2.name = ANY(skills_filter)
                AND ps2.proficiency_level IN ('advanced', 'expert')
        ))
    GROUP BY p.id, p.first_name, p.last_name, p.title, p.location, p.summary, 
             p.profile_image_url, p.search_vector
    ORDER BY 
        CASE 
            WHEN search_query IS NOT NULL THEN ts_rank(p.search_vector, plainto_tsquery('english', search_query))
            ELSE p.updated_at
        END DESC
    LIMIT limit_count OFFSET offset_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_limit(real)
 RETURNS real
 LANGUAGE c
 STRICT
AS '$libdir/pg_trgm', $function$set_limit$function$
;

CREATE OR REPLACE FUNCTION public.show_db_tree()
 RETURNS TABLE(tree_structure text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- First show all databases
    RETURN QUERY
    SELECT ':file_folder: ' || datname || ' (DATABASE)'
    FROM pg_database 
    WHERE datistemplate = false;

    -- Then show current database structure
    RETURN QUERY
    WITH RECURSIVE 
    -- Get schemas
    schemas AS (
        SELECT 
            n.nspname AS object_name,
            1 AS level,
            n.nspname AS path,
            'SCHEMA' AS object_type
        FROM pg_namespace n
        WHERE n.nspname NOT LIKE 'pg_%' 
        AND n.nspname != 'information_schema'
    ),

    -- Get all objects (tables, views, functions, etc.)
    objects AS (
        SELECT 
            c.relname AS object_name,
            2 AS level,
            s.path || ' → ' || c.relname AS path,
            CASE c.relkind
                WHEN 'r' THEN 'TABLE'
                WHEN 'v' THEN 'VIEW'
                WHEN 'm' THEN 'MATERIALIZED VIEW'
                WHEN 'i' THEN 'INDEX'
                WHEN 'S' THEN 'SEQUENCE'
                WHEN 'f' THEN 'FOREIGN TABLE'
            END AS object_type
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN schemas s ON n.nspname = s.object_name
        WHERE c.relkind IN ('r','v','m','i','S','f')

        UNION ALL

        SELECT 
            p.proname AS object_name,
            2 AS level,
            s.path || ' → ' || p.proname AS path,
            'FUNCTION' AS object_type
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        JOIN schemas s ON n.nspname = s.object_name
    ),

    -- Combine schemas and objects
    combined AS (
        SELECT * FROM schemas
        UNION ALL
        SELECT * FROM objects
    )

    -- Final output with tree-like formatting
    SELECT 
        REPEAT('    ', level) || 
        CASE 
            WHEN level = 1 THEN '└── :open_file_folder: '
            ELSE '    └── ' || 
                CASE object_type
                    WHEN 'TABLE' THEN ':bar_chart: '
                    WHEN 'VIEW' THEN ':eye: '
                    WHEN 'MATERIALIZED VIEW' THEN ':newspaper: '
                    WHEN 'FUNCTION' THEN ':zap: '
                    WHEN 'INDEX' THEN ':mag: '
                    WHEN 'SEQUENCE' THEN ':1234: '
                    WHEN 'FOREIGN TABLE' THEN ':globe_with_meridians: '
                    ELSE ''
                END
        END || object_name || ' (' || object_type || ')'
    FROM combined
    ORDER BY path;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.show_limit()
 RETURNS real
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_limit$function$
;

CREATE OR REPLACE FUNCTION public.show_trgm(text)
 RETURNS text[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_trgm$function$
;

CREATE OR REPLACE FUNCTION public.similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity$function$
;

CREATE OR REPLACE FUNCTION public.similarity_dist(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_dist$function$
;

CREATE OR REPLACE FUNCTION public.similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_op$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec(sparsevec, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_cmp(sparsevec, sparsevec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_cmp$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_eq(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_eq$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_ge(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_ge$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_gt(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_gt$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_in(cstring, oid, integer)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_in$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_l2_squared_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l2_squared_distance$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_le(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_le$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_lt(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_lt$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_ne(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_ne$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_negative_inner_product(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_negative_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_out(sparsevec)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_out$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_recv(internal, oid, integer)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_recv$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_send(sparsevec)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_send$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_to_halfvec(sparsevec, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_to_vector(sparsevec, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_typmod_in$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_op$function$
;

CREATE OR REPLACE FUNCTION public.subvector(vector, integer, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$subvector$function$
;

CREATE OR REPLACE FUNCTION public.subvector(halfvec, integer, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_subvector$function$
;

CREATE OR REPLACE FUNCTION public.update_content_chunk_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.search_vector := to_tsvector('english', coalesce(NEW.chunk_text, ''));
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_experience_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.company_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.position_title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.technologies, ' '), '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.achievements, ' '), '')), 'C');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_professional_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.first_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.last_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.location, '')), 'D');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_project_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.detailed_description, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.technologies, ' '), '')), 'B');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$
;

CREATE OR REPLACE FUNCTION public.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$
;

CREATE OR REPLACE FUNCTION public.vector(vector, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector$function$
;

CREATE OR REPLACE FUNCTION public.vector_accum(double precision[], vector)
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_accum$function$
;

CREATE OR REPLACE FUNCTION public.vector_add(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_add$function$
;

CREATE OR REPLACE FUNCTION public.vector_avg(double precision[])
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_avg$function$
;

CREATE OR REPLACE FUNCTION public.vector_cmp(vector, vector)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_cmp$function$
;

CREATE OR REPLACE FUNCTION public.vector_combine(double precision[], double precision[])
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_combine$function$
;

CREATE OR REPLACE FUNCTION public.vector_concat(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_concat$function$
;

CREATE OR REPLACE FUNCTION public.vector_dims(vector)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_dims$function$
;

CREATE OR REPLACE FUNCTION public.vector_dims(halfvec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_vector_dims$function$
;

CREATE OR REPLACE FUNCTION public.vector_eq(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_eq$function$
;

CREATE OR REPLACE FUNCTION public.vector_ge(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_ge$function$
;

CREATE OR REPLACE FUNCTION public.vector_gt(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_gt$function$
;

CREATE OR REPLACE FUNCTION public.vector_in(cstring, oid, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_in$function$
;

CREATE OR REPLACE FUNCTION public.vector_l2_squared_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_l2_squared_distance$function$
;

CREATE OR REPLACE FUNCTION public.vector_le(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_le$function$
;

CREATE OR REPLACE FUNCTION public.vector_lt(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_lt$function$
;

CREATE OR REPLACE FUNCTION public.vector_mul(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_mul$function$
;

CREATE OR REPLACE FUNCTION public.vector_ne(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_ne$function$
;

CREATE OR REPLACE FUNCTION public.vector_negative_inner_product(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_negative_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.vector_norm(vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_norm$function$
;

CREATE OR REPLACE FUNCTION public.vector_out(vector)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_out$function$
;

CREATE OR REPLACE FUNCTION public.vector_recv(internal, oid, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_recv$function$
;

CREATE OR REPLACE FUNCTION public.vector_send(vector)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_send$function$
;

CREATE OR REPLACE FUNCTION public.vector_spherical_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_spherical_distance$function$
;

CREATE OR REPLACE FUNCTION public.vector_sub(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_sub$function$
;

CREATE OR REPLACE FUNCTION public.vector_to_float4(vector, integer, boolean)
 RETURNS real[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_to_float4$function$
;

CREATE OR REPLACE FUNCTION public.vector_to_halfvec(vector, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.vector_to_sparsevec(vector, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.vector_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_typmod_in$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_op$function$
;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_content_sources_updated_at BEFORE UPDATE ON public.content_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_skills_updated_at BEFORE UPDATE ON public.professional_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SCHEMA EXTRACTION COMPLETE
-- ============================================
-- Extracted on: 2025-09-25T07:05:53.155Z
-- Total Tables: 20
-- Total Sequences: 7
-- Total Indexes: 35
-- Total Functions: 163
-- Total Triggers: 3
-- Total Views: 0
