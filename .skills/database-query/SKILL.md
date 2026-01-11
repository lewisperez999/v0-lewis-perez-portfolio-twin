# Database Query

Create optimized PostgreSQL queries for the portfolio database.

## Description

Write safe, optimized PostgreSQL queries using the project's database patterns. Includes parameterized queries, proper joins, and pg-vector operations.

## Instructions

1. Import `query` from `@/lib/database`
2. Use parameterized queries with `$1`, `$2`, etc.
3. Build dynamic queries safely
4. Handle results with proper typing
5. Include error handling

## Parameters

- `table` - Target table name
- `operation` - SELECT, INSERT, UPDATE, DELETE
- `filters` - Dynamic filter conditions
- `includes_vector` - Whether using pg-vector operations

## Basic Query Pattern

```typescript
import { query } from '@/lib/database';

// Simple SELECT
const results = await query(
  'SELECT * FROM experiences WHERE id = $1',
  [experienceId]
);

// INSERT with RETURNING
const inserted = await query(
  `INSERT INTO experiences (company, position, start_date)
   VALUES ($1, $2, $3)
   RETURNING *`,
  [company, position, startDate]
);

// UPDATE
await query(
  `UPDATE experiences 
   SET company = $1, position = $2, updated_at = NOW()
   WHERE id = $3`,
  [company, position, id]
);

// DELETE
await query(
  'DELETE FROM experiences WHERE id = $1',
  [id]
);
```

## Dynamic Query Builder

```typescript
interface ExperienceFilters {
  company?: string;
  position?: string;
  startYear?: number;
  technology?: string;
  limit?: number;
}

async function getExperiences(filters: ExperienceFilters) {
  const params: any[] = [];
  let sql = 'SELECT * FROM experiences WHERE 1=1';
  
  if (filters.company) {
    sql += ` AND company ILIKE $${params.length + 1}`;
    params.push(`%${filters.company}%`);
  }
  
  if (filters.position) {
    sql += ` AND position ILIKE $${params.length + 1}`;
    params.push(`%${filters.position}%`);
  }
  
  if (filters.startYear) {
    sql += ` AND EXTRACT(YEAR FROM start_date) = $${params.length + 1}`;
    params.push(filters.startYear);
  }
  
  if (filters.technology) {
    sql += ` AND $${params.length + 1} = ANY(technologies)`;
    params.push(filters.technology);
  }
  
  sql += ' ORDER BY start_date DESC';
  
  if (filters.limit) {
    sql += ` LIMIT $${params.length + 1}`;
    params.push(filters.limit);
  }
  
  return query(sql, params);
}
```

## Vector Search Query

```typescript
import { query } from '@/lib/database';

// Find similar content using pg-vector
async function findSimilarContent(embedding: number[], limit = 5) {
  return query(
    `SELECT 
       id, 
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

// Hybrid search (vector + full-text)
async function hybridSearch(searchText: string, embedding: number[]) {
  return query(
    `SELECT 
       id,
       content,
       ts_rank(search_vector, plainto_tsquery($1)) as text_rank,
       1 - (embedding <=> $2::vector) as vector_similarity,
       (ts_rank(search_vector, plainto_tsquery($1)) * 0.3 + 
        (1 - (embedding <=> $2::vector)) * 0.7) as combined_score
     FROM content_chunks
     WHERE search_vector @@ plainto_tsquery($1)
        OR embedding <=> $2::vector < 0.5
     ORDER BY combined_score DESC
     LIMIT 10`,
    [searchText, `[${embedding.join(',')}]`]
  );
}
```

## Join Queries

```typescript
// Get experiences with related skills
async function getExperiencesWithSkills() {
  return query(`
    SELECT 
      e.*,
      COALESCE(
        json_agg(
          json_build_object('name', s.skill_name, 'category', s.category)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) as skills
    FROM experiences e
    LEFT JOIN experience_skills es ON e.id = es.experience_id
    LEFT JOIN skills s ON es.skill_id = s.id
    GROUP BY e.id
    ORDER BY e.start_date DESC
  `);
}
```

## Error Handling

```typescript
async function safeQuery<T>(
  sql: string,
  params: any[] = []
): Promise<{ data: T[] | null; error: Error | null }> {
  try {
    const result = await query(sql, params);
    return { data: result as T[], error: null };
  } catch (error) {
    console.error('Database query error:', error);
    return { data: null, error: error as Error };
  }
}
```

## Best Practices

1. **Always use parameterized queries** - Never concatenate user input
2. **Use ILIKE for case-insensitive search** - Better UX
3. **Limit results** - Always include a LIMIT clause
4. **Index key columns** - Ensure filters use indexed columns
5. **Handle NULL values** - Use COALESCE when needed
6. **Type your results** - Use TypeScript interfaces
