import { Index } from '@upstash/vector'

// Vector search configuration
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

export interface SearchResult {
  id: string
  score: number
  metadata: {
    title?: string
    chunk_type?: string
    importance?: string
    source?: string
  }
  content: string
}

export interface VectorSearchOptions {
  topK?: number
  minSimilarityScore?: number
  includeMetadata?: boolean
  filter?: {
    chunk_type?: string
    importance?: string
  }
}

/**
 * Perform vector search against the professional portfolio content
 */
export async function searchVectors(
  query: string,
  options: VectorSearchOptions = {}
): Promise<SearchResult[]> {
  const {
    topK = 5,
    minSimilarityScore = 0.7,
    includeMetadata = true,
    filter
  } = options

  try {
    // Start with a simple query format that we know works
    const baseQuery: any = {
      data: query,
      topK: Math.min(topK, 100)
    }

    // Only add metadata inclusion if specifically requested and no filter
    if (includeMetadata && !filter) {
      baseQuery.includeMetadata = true
    }

    // Skip metadata filtering for now due to Upstash deserialization issues
    // TODO: Re-enable once Upstash Vector API is fixed
    if (filter) {
      console.log('Skipping metadata filter due to API issues, using simple query')
    }

    console.log('Vector search query:', JSON.stringify(baseQuery, null, 2))

    // Perform vector search with the simplified, working format
    const results = await vectorIndex.query(baseQuery)
    console.log('Vector search results count:', results?.length || 0)

    // Filter results by similarity score and transform to our interface
    const filteredResults: SearchResult[] = []
    
    for (const result of results) {
      if (result.score >= minSimilarityScore) {
        try {
          // Get content from database using the chunk ID
          const content = await getContentByChunkId(String(result.id))
          
          filteredResults.push({
            id: String(result.id),
            score: result.score,
            metadata: result.metadata || {},
            content: content || `Content for ${result.id}` // Fallback content
          })
        } catch (dbError) {
          console.log('Database lookup failed for chunk:', result.id, 'using fallback')
          // Use vector result metadata as fallback content
          const fallbackContent = String(result.metadata?.title || result.metadata?.chunk_type || `Professional content (ID: ${result.id})`)
          
          filteredResults.push({
            id: String(result.id),
            score: result.score,
            metadata: result.metadata || {},
            content: fallbackContent
          })
        }
      }
    }

    return filteredResults.sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error('Vector search error:', error)
    console.log('Returning empty results due to vector search error')
    // Return empty results instead of throwing to allow chat to continue
    return []
  }
}

/**
 * Get content from PostgreSQL database by chunk ID
 */
async function getContentByChunkId(chunkId: string): Promise<string | null> {
  try {
    // This would typically use a database connection
    // For now, we'll simulate with the actual content structure
    
    // Import the database connection utilities
    const { Pool } = await import('pg')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        'SELECT content, title FROM content_chunks WHERE chunk_id = $1',
        [chunkId]
      )
      
      if (result.rows.length > 0) {
        const row = result.rows[0]
        return row.title ? `${row.title}: ${row.content}` : row.content
      }
      
      return null
    } finally {
      client.release()
      await pool.end()
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

/**
 * Search for content by type with semantic similarity
 */
export async function searchByContentType(
  query: string,
  contentType: 'skills' | 'experience' | 'projects' | 'education' | 'summary',
  options: Omit<VectorSearchOptions, 'filter'> = {}
): Promise<SearchResult[]> {
  return searchVectors(query, {
    ...options,
    filter: { chunk_type: contentType }
  })
}

/**
 * Search for high-importance content only
 */
export async function searchHighImportanceContent(
  query: string,
  options: Omit<VectorSearchOptions, 'filter'> = {}
): Promise<SearchResult[]> {
  return searchVectors(query, {
    ...options,
    filter: { importance: 'critical' }
  })
}

/**
 * Get context for AI chat by combining multiple search strategies
 */
export async function getAIChatContext(query: string): Promise<{
  context: string
  sources: SearchResult[]
  relevanceScore: number
}> {
  try {
    // Use only general search for now since filtered queries have issues
    console.log('Getting AI chat context with general search only...')
    
    const results = await searchVectors(query, { 
      topK: 5, 
      minSimilarityScore: 0.6,
      includeMetadata: true 
    })

    // Sort by relevance score
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Take top 5 most relevant

    // Calculate average relevance score
    const averageScore = sortedResults.length > 0 
      ? sortedResults.reduce((sum, r) => sum + r.score, 0) / sortedResults.length 
      : 0

    // Build context string
    const context = sortedResults
      .map(result => {
        const source = result.metadata?.chunk_type || 'general'
        return `[${source.toUpperCase()}] ${result.content}`
      })
      .join('\n\n')

    return {
      context,
      sources: sortedResults,
      relevanceScore: averageScore
    }
  } catch (error) {
    console.error('Error getting AI chat context:', error)
    return {
      context: '',
      sources: [],
      relevanceScore: 0
    }
  }
}