-- Migration 002: AI-to-AI Chat Sessions Support
-- Lewis Perez Portfolio Database Schema Extension
-- Adds support for AI-to-AI conversation sessions and analytics

-- AI-to-AI conversation sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    conversation_type VARCHAR(50) NOT NULL CHECK (conversation_type IN ('interview', 'assessment', 'exploration', 'analysis')),
    persona VARCHAR(50) CHECK (persona IN ('interviewer', 'technical_assessor', 'curious_explorer', 'analyst')),
    ai_model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived'))
);

-- Enhanced conversation tracking for AI-to-AI interactions
CREATE TABLE IF NOT EXISTS ai_conversation_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE,
    conversation_turn INTEGER NOT NULL,
    question_type VARCHAR(50),
    response_quality_score DECIMAL(3,2) CHECK (response_quality_score >= 0 AND response_quality_score <= 10),
    technical_depth_score DECIMAL(3,2) CHECK (technical_depth_score >= 0 AND technical_depth_score <= 10),
    topics_mentioned TEXT[],
    technologies_discussed TEXT[],
    sources_utilized INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    persona_consistency_score DECIMAL(3,2) CHECK (persona_consistency_score >= 0 AND persona_consistency_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation comparison tracking
CREATE TABLE IF NOT EXISTS conversation_comparisons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_ids TEXT[] NOT NULL,
    comparison_type VARCHAR(50) NOT NULL,
    comparison_results JSONB DEFAULT '{}',
    insights JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'mcp_tool'
);

-- Session insights cache for performance
CREATE TABLE IF NOT EXISTS session_insights_cache (
    session_id VARCHAR(255) PRIMARY KEY REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE,
    topics_covered TEXT[],
    expertise_areas_mentioned TEXT[],
    confidence_scores JSONB DEFAULT '{}',
    conversation_quality_score DECIMAL(3,2) CHECK (conversation_quality_score >= 0 AND conversation_quality_score <= 10),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_type ON ai_chat_sessions(conversation_type);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_created ON ai_chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_status ON ai_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_last_activity ON ai_chat_sessions(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_ai_conversation_analytics_session ON ai_conversation_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_analytics_turn ON ai_conversation_analytics(conversation_turn);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_analytics_created ON ai_conversation_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_analytics_quality ON ai_conversation_analytics(response_quality_score);

CREATE INDEX IF NOT EXISTS idx_conversation_comparisons_created ON conversation_comparisons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_comparisons_type ON conversation_comparisons(comparison_type);

-- Triggers for maintaining data consistency and automation

-- Update last_activity on session when new analytics record is added
CREATE OR REPLACE FUNCTION update_session_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_chat_sessions 
    SET last_activity = NOW(),
        message_count = message_count + 1
    WHERE session_id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_session_last_activity
    AFTER INSERT ON ai_conversation_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_session_last_activity();

-- Auto-archive old sessions (older than 30 days with no activity)
CREATE OR REPLACE FUNCTION archive_old_sessions()
RETURNS void AS $$
BEGIN
    UPDATE ai_chat_sessions 
    SET status = 'archived' 
    WHERE last_activity < NOW() - INTERVAL '30 days' 
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old comparison records (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_comparisons()
RETURNS void AS $$
BEGIN
    DELETE FROM conversation_comparisons 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions for the application
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_chat_sessions TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_conversation_analytics TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_comparisons TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON session_insights_cache TO PUBLIC;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Add comments for documentation
COMMENT ON TABLE ai_chat_sessions IS 'Tracks AI-to-AI conversation sessions with metadata and status';
COMMENT ON TABLE ai_conversation_analytics IS 'Detailed analytics for each conversation turn in AI-to-AI sessions';
COMMENT ON TABLE conversation_comparisons IS 'Results of comparing multiple conversation sessions';
COMMENT ON TABLE session_insights_cache IS 'Cached insights for conversation sessions to improve performance';

COMMENT ON COLUMN ai_chat_sessions.conversation_type IS 'Type of conversation: interview, assessment, exploration, analysis';
COMMENT ON COLUMN ai_chat_sessions.persona IS 'AI persona for the conversation: interviewer, technical_assessor, curious_explorer, analyst';
COMMENT ON COLUMN ai_chat_sessions.metadata IS 'Additional session configuration and context data';

COMMENT ON COLUMN ai_conversation_analytics.conversation_turn IS 'Sequential turn number in the conversation';
COMMENT ON COLUMN ai_conversation_analytics.response_quality_score IS 'Quality score from 0-10 for the AI response';
COMMENT ON COLUMN ai_conversation_analytics.technical_depth_score IS 'Technical depth score from 0-10 for the conversation turn';
COMMENT ON COLUMN ai_conversation_analytics.persona_consistency_score IS 'How well the response matched the expected persona (0-10)';

-- Create a view for easy session overview
CREATE OR REPLACE VIEW ai_session_overview AS
SELECT 
    s.session_id,
    s.conversation_type,
    s.persona,
    s.ai_model,
    s.created_at,
    s.last_activity,
    s.message_count,
    s.status,
    COALESCE(AVG(a.response_quality_score), 0) as avg_response_quality,
    COALESCE(AVG(a.technical_depth_score), 0) as avg_technical_depth,
    COALESCE(AVG(a.persona_consistency_score), 0) as avg_persona_consistency,
    COALESCE(AVG(a.response_time_ms), 0) as avg_response_time_ms,
    COUNT(a.id) as analytics_records_count
FROM ai_chat_sessions s
LEFT JOIN ai_conversation_analytics a ON s.session_id = a.session_id
GROUP BY s.session_id, s.conversation_type, s.persona, s.ai_model, s.created_at, s.last_activity, s.message_count, s.status
ORDER BY s.last_activity DESC;

COMMENT ON VIEW ai_session_overview IS 'Comprehensive overview of AI chat sessions with aggregated analytics';