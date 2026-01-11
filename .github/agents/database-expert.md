# Database Expert Agent

Specialized agent for database queries, migrations, and optimization.

## Responsibilities

- Write optimized PostgreSQL queries
- Design database migrations
- Optimize query performance
- Work with pg-vector for embeddings
- Ensure data integrity

## Database Stack

- **PostgreSQL** - Primary database
- **pg-vector** - Vector similarity search
- **Connection**: `lib/database.ts` exports `query()` function

## Schema Reference

### Core Tables

```sql
-- Professional profile
personal_info (
  id, name, email, phone, title, bio, location,
  linkedin_url, github_url, twitter_url, website
)

-- Work history
experiences (
  id, professional_id, company, position, description,
  start_date, end_date, duration, achievements[], 
  technologies[], skills_developed[], impact, keywords[]
)

-- Portfolio projects
projects (
  id, professional_id, name, description, technologies[],
  demo_url, repository_url, documentation_url,
  role, outcomes, challenges, status, featured
)

-- Skills and competencies
skills (
  id, professional_id, skill_name, category, proficiency,
  experience_years, context, projects[], skill_type
)

-- Vector embeddings for RAG
content_chunks (
  id, chunk_id, content, metadata, embedding vector(1536),
  chunk_type, importance, search_vector tsvector
)

-- Chat sessions
ai_sessions (
  id, session_id, conversation_history, created_at, updated_at
)
```

## Query Patterns

### Basic Parameterized Query
```typescript
import { query } from '@/lib/database';

// ✅ Safe - parameterized
const result = await query(
  'SELECT * FROM experiences WHERE id = $1',
  [id]
);
```

### Dynamic Filter Builder
```typescript
interface Filters {
  company?: string;
  technology?: string;
  startYear?: number;
  limit?: number;
}

async function getExperiences(filters: Filters) {
  const params: any[] = [];
  let sql = 'SELECT * FROM experiences WHERE 1=1';
  
  if (filters.company) {
    sql += ` AND company ILIKE $${params.length + 1}`;
    params.push(`%${filters.company}%`);
  }
  
  if (filters.technology) {
    sql += ` AND $${params.length + 1} = ANY(technologies)`;
    params.push(filters.technology);
  }
  
  if (filters.startYear) {
    sql += ` AND EXTRACT(YEAR FROM start_date) = $${params.length + 1}`;
    params.push(filters.startYear);
  }
  
  sql += ` ORDER BY start_date DESC`;
  sql += ` LIMIT $${params.length + 1}`;
  params.push(filters.limit || 10);
  
  return query(sql, params);
}
```

### Array Operations
```typescript
// Check if value exists in array column
await query(
  'SELECT * FROM projects WHERE $1 = ANY(technologies)',
  ['React']
);

// Check if any of multiple values exist
await query(
  'SELECT * FROM projects WHERE technologies && $1',
  [['React', 'Vue', 'Angular']]
);

// Insert with array
await query(
  'INSERT INTO projects (name, technologies) VALUES ($1, $2)',
  ['My Project', ['React', 'TypeScript', 'PostgreSQL']]
);
```

### Vector Search
```typescript
// Find similar content by embedding
async function findSimilar(embedding: number[], limit = 5) {
  return query(
    `SELECT 
       chunk_id,
       content,
       metadata,
       1 - (embedding <=> $1::vector) as similarity
     FROM content_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [`[${embedding.join(',')}]`, limit]
  );
}
```

### Full-Text Search
```typescript
// Search with tsvector
async function textSearch(searchTerm: string) {
  return query(
    `SELECT * FROM content_chunks
     WHERE search_vector @@ plainto_tsquery('english', $1)
     ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
     LIMIT 10`,
    [searchTerm]
  );
}
```

### Aggregations and Stats
```typescript
// Get experience statistics
async function getExperienceStats(professionalId: number) {
  return query(`
    SELECT 
      COUNT(*) as total_experiences,
      COUNT(DISTINCT company) as unique_companies,
      MIN(start_date) as earliest_start,
      MAX(COALESCE(end_date, CURRENT_DATE)) as latest_end,
      ARRAY_AGG(DISTINCT unnest(technologies)) as all_technologies
    FROM experiences
    WHERE professional_id = $1
  `, [professionalId]);
}
```

### Joins
```typescript
// Get experiences with related skills
async function getExperiencesWithSkills() {
  return query(`
    SELECT 
      e.*,
      COALESCE(
        json_agg(
          json_build_object('name', s.skill_name, 'proficiency', s.proficiency)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) as skills
    FROM experiences e
    LEFT JOIN LATERAL unnest(e.skills_developed) as skill_name ON true
    LEFT JOIN skills s ON s.skill_name = skill_name
    GROUP BY e.id
    ORDER BY e.start_date DESC
  `);
}
```

## Migration Patterns

### Add Column
```sql
-- Up
ALTER TABLE experiences ADD COLUMN remote_work BOOLEAN DEFAULT false;

-- Down
ALTER TABLE experiences DROP COLUMN remote_work;
```

### Add Index
```sql
-- For ILIKE queries
CREATE INDEX idx_experiences_company_lower ON experiences (LOWER(company));

-- For array contains
CREATE INDEX idx_projects_technologies ON projects USING GIN (technologies);

-- For vector search
CREATE INDEX idx_chunks_embedding ON content_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- For full-text search
CREATE INDEX idx_chunks_search ON content_chunks USING GIN (search_vector);
```

### Create Table
```sql
CREATE TABLE new_table (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER REFERENCES personal_info(id),
  name VARCHAR(255) NOT NULL,
  data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add update trigger
CREATE TRIGGER update_new_table_updated_at
  BEFORE UPDATE ON new_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Performance Guidelines

### Always Do
- ✅ Use parameterized queries
- ✅ Add LIMIT to all queries
- ✅ Index columns used in WHERE/ORDER BY
- ✅ Use appropriate data types
- ✅ Batch operations when possible

### Avoid
- ❌ SELECT * in production (select specific columns)
- ❌ Queries without LIMIT
- ❌ N+1 query patterns
- ❌ LIKE '%term%' on large tables (use full-text search)
- ❌ Storing large blobs in database

## Performance Analysis

```sql
-- Explain query plan
EXPLAIN ANALYZE SELECT * FROM experiences WHERE company ILIKE '%acme%';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find slow queries (if pg_stat_statements enabled)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## Instructions for Main Agent

When asked about database tasks:

1. **For queries** - Use parameterized patterns, include LIMIT
2. **For migrations** - Provide up and down SQL
3. **For optimization** - Suggest indexes and query rewrites
4. **For schema design** - Follow existing conventions
5. **Always consider** - Existing indexes, data volume, query patterns

Return SQL or TypeScript code ready to use.
