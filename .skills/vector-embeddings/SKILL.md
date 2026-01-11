# Vector Embeddings

Work with vector embeddings for semantic search.

## Description

Create, store, and search vector embeddings using OpenAI's embedding model and Upstash Vector database.

## Instructions

1. Generate embeddings using OpenAI
2. Store in Upstash Vector or PostgreSQL pg-vector
3. Search using cosine similarity
4. Combine with metadata filtering

## Parameters

- `content` - Text to embed
- `metadata` - Associated metadata
- `search_query` - Query text for search
- `top_k` - Number of results to return

## Generate Embedding

```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  
  return response.data[0].embedding;
}
```

## Store in Upstash Vector

```typescript
import { Index } from '@upstash/vector';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

interface ContentMetadata {
  chunk_type: 'experience' | 'project' | 'skill' | 'education';
  content: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  source_id?: string;
}

async function storeEmbedding(
  id: string,
  embedding: number[],
  metadata: ContentMetadata
) {
  await index.upsert({
    id,
    vector: embedding,
    metadata,
  });
}
```

## Search Vectors

```typescript
import { searchVectors } from '@/lib/vector-search';

// Basic search
const results = await searchVectors('React development experience', {
  topK: 10,
});

// With filters
const filteredResults = await searchVectors('database design', {
  topK: 5,
  filter: {
    chunk_type: 'experience',
    importance: { $in: ['critical', 'high'] },
  },
});
```

## Direct Upstash Query

```typescript
async function searchSimilar(
  queryText: string,
  options: {
    topK?: number;
    filter?: Record<string, any>;
    minScore?: number;
  } = {}
) {
  const { topK = 10, filter, minScore = 0.3 } = options;
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(queryText);
  
  // Search
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    filter,
    includeMetadata: true,
    includeVectors: false,
  });
  
  // Filter by minimum score
  return results.filter(r => r.score >= minScore);
}
```

## PostgreSQL pg-vector Search

```typescript
import { query } from '@/lib/database';

async function pgVectorSearch(
  queryEmbedding: number[],
  limit = 10
) {
  const embeddingString = `[${queryEmbedding.join(',')}]`;
  
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
    [embeddingString, limit]
  );
}
```

## Batch Upsert

```typescript
async function batchUpsertEmbeddings(
  items: Array<{
    id: string;
    content: string;
    metadata: ContentMetadata;
  }>
) {
  // Generate embeddings in parallel (with rate limiting)
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const embeddings = await Promise.all(
      batch.map(async (item) => ({
        ...item,
        embedding: await generateEmbedding(item.content),
      }))
    );
    
    // Upsert to vector store
    await index.upsert(
      embeddings.map(({ id, embedding, metadata }) => ({
        id,
        vector: embedding,
        metadata,
      }))
    );
    
    results.push(...embeddings);
    
    // Rate limit delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
```

## Chunking Content

```typescript
function chunkContent(
  content: string,
  options: {
    maxChunkSize?: number;
    overlap?: number;
  } = {}
) {
  const { maxChunkSize = 500, overlap = 50 } = options;
  const chunks: string[] = [];
  
  // Split by paragraphs first
  const paragraphs = content.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        // Keep overlap from end of previous chunk
        currentChunk = currentChunk.slice(-overlap) + ' ' + paragraph;
      } else {
        chunks.push(paragraph.slice(0, maxChunkSize));
        currentChunk = paragraph.slice(maxChunkSize - overlap);
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
```

## Best Practices

1. **Chunk appropriately** - 500-1000 tokens per chunk
2. **Include context** - Add relevant metadata
3. **Set minimum scores** - Filter low-quality matches
4. **Batch operations** - Process multiple items efficiently
5. **Rate limit API calls** - Respect OpenAI limits
6. **Cache embeddings** - Don't regenerate unchanged content
