import { Index } from "@upstash/vector"

// Vector search configuration
let vectorIndex: Index | null = null

// Only initialize if environment variables are available
if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
  vectorIndex = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  })
}

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
  [key: string]: unknown // Index signature for compatibility
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
export async function searchVectors(query: string, options: VectorSearchOptions = {}): Promise<SearchResult[]> {
  if (!vectorIndex) {
    console.log("Vector search not available, returning mock results for:", query)
    return getMockSearchResults(query, options)
  }

  const { topK = 5, minSimilarityScore = 0.3, includeMetadata = true, filter } = options

  try {
    // Start with a simple query format that we know works
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery: any = {
      data: query,
      topK: Math.min(topK, 100),
    }

    // Only add metadata inclusion if specifically requested and no filter
    if (includeMetadata && !filter) {
      baseQuery.includeMetadata = true
    }

    // Skip metadata filtering for now due to Upstash deserialization issues
    // TODO: Re-enable once Upstash Vector API is fixed
    if (filter) {
      console.log("Skipping metadata filter due to API issues, using simple query")
    }

    console.log("Vector search query:", JSON.stringify(baseQuery, null, 2))

    // Perform vector search with the simplified, working format
    const results = await vectorIndex.query(baseQuery)
    console.log("Vector search results count:", results?.length || 0)

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
            content: content || `Content for ${result.id}`, // Fallback content
          })
        } catch (dbError) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          console.log("Database lookup failed for chunk:", result.id, "using fallback", dbError)
          // Use vector result metadata as fallback content
          const fallbackContent = String(
            result.metadata?.title || result.metadata?.chunk_type || `Professional content (ID: ${result.id})`,
          )

          filteredResults.push({
            id: String(result.id),
            score: result.score,
            metadata: result.metadata || {},
            content: fallbackContent,
          })
        }
      }
    }

    return filteredResults.sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error("Vector search error:", error)
    console.log("Falling back to mock results due to vector search error")
    return getMockSearchResults(query, options)
  }
}

function getMockSearchResults(query: string, options: VectorSearchOptions = {}): SearchResult[] {
  const { topK = 5 } = options

  // Mock professional content based on common queries
  const mockContent = [
    {
      id: "exp-1",
      score: 0.95,
      metadata: { chunk_type: "experience", importance: "critical", title: "Senior Software Engineer at ING" },
      content:
        "Senior Software Engineer at ING Australia (2022-2024). Led microservices architecture optimization, reducing API response times from 500ms to 200ms. Implemented automated testing frameworks achieving 95% code coverage.",
    },
    {
      id: "skills-1",
      score: 0.9,
      metadata: { chunk_type: "skills", importance: "critical", title: "Backend Technologies" },
      content:
        "Expert in Java, Spring Boot, AWS, PostgreSQL, Redis. 8+ years of enterprise software development experience with focus on scalable backend systems and microservices architecture.",
    },
    {
      id: "proj-1",
      score: 0.85,
      metadata: { chunk_type: "projects", importance: "high", title: "E-commerce Platform" },
      content:
        "Built full-stack e-commerce platform using Next.js and Shopify integration. Implemented real-time inventory management and payment processing with 99.9% uptime.",
    },
    {
      id: "edu-1",
      score: 0.8,
      metadata: { chunk_type: "education", importance: "medium", title: "Computer Science Education" },
      content:
        "Bachelor of Science in Computer Science. Currently pursuing advanced studies in Melbourne, Australia. Continuous learning in cloud technologies and AI/ML applications.",
    },
    {
      id: "summary-1",
      score: 0.75,
      metadata: { chunk_type: "summary", importance: "critical", title: "Professional Summary" },
      content:
        "Experienced Software Engineer with 8+ years in enterprise development. Specialized in Java, Spring Boot, AWS, and microservices. Proven track record of optimizing system performance and leading technical initiatives.",
    },
  ]

  // Filter by query relevance (simple keyword matching for mock)
  const queryLower = query.toLowerCase()
  const relevantContent = mockContent.filter(
    (item) =>
      item.content.toLowerCase().includes(queryLower) ||
      item.metadata.title?.toLowerCase().includes(queryLower) ||
      queryLower.split(" ").some((word) => item.content.toLowerCase().includes(word)),
  )

  return relevantContent.slice(0, topK)
}

/**
 * Get content from PostgreSQL database by chunk ID
 */
async function getContentByChunkId(chunkId: string): Promise<string | null> {
  try {
    if (!process.env.DATABASE_URL) {
      console.log("Database not configured, using fallback content")
      return null
    }

    // Import the database connection utilities
    const { Pool } = await import("pg")

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })

    const client = await pool.connect()

    try {
      const result = await client.query("SELECT content, title FROM content_chunks WHERE chunk_id = $1", [chunkId])

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
    console.error("Database query error:", error)
    return null
  }
}

/**
 * Search for content by type with semantic similarity
 */
export async function searchByContentType(
  query: string,
  contentType: "skills" | "experience" | "projects" | "education" | "summary",
  options: Omit<VectorSearchOptions, "filter"> = {},
): Promise<SearchResult[]> {
  return searchVectors(query, {
    ...options,
    filter: { chunk_type: contentType },
  })
}

/**
 * Search for high-importance content only
 */
export async function searchHighImportanceContent(
  query: string,
  options: Omit<VectorSearchOptions, "filter"> = {},
): Promise<SearchResult[]> {
  return searchVectors(query, {
    ...options,
    filter: { importance: "critical" },
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
    console.log("Getting AI chat context for query:", query)

    const results = await searchVectors(query, {
      topK: 5,
      minSimilarityScore: 0.3,
      includeMetadata: true,
    })

    // Sort by relevance score
    const sortedResults = results.sort((a, b) => b.score - a.score).slice(0, 5) // Take top 5 most relevant

    // Calculate average relevance score
    const averageScore =
      sortedResults.length > 0 ? sortedResults.reduce((sum, r) => sum + r.score, 0) / sortedResults.length : 0

    // Build context string
    const context = sortedResults
      .map((result) => {
        const source = result.metadata?.chunk_type || "general"
        return `[${source.toUpperCase()}] ${result.content}`
      })
      .join("\n\n")

    return {
      context,
      sources: sortedResults,
      relevanceScore: averageScore,
    }
  } catch (error) {
    console.error("Error getting AI chat context:", error)
    return {
      context:
        "I am Lewis Perez, a Senior Software Engineer with 8+ years of experience in enterprise development, specializing in Java, Spring Boot, AWS, and microservices architecture.",
      sources: [],
      relevanceScore: 0.5,
    }
  }
}
