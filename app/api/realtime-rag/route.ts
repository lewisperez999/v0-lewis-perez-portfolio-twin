import { NextRequest, NextResponse } from "next/server";
import { getAIChatContext } from "@/lib/vector-search";
import { getCachedData } from "@/lib/upstash";

// Quick Win #4: Enable ISR (cannot use edge runtime due to pg dependency)
export const revalidate = 3600; // Revalidate every hour

/**
 * Fast RAG endpoint optimized for OpenAI Realtime API
 * Returns relevant context for voice conversations with minimal latency
 */
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    // Trim query to prevent excessive searches
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return NextResponse.json(
        { 
          context: "General professional background context available.",
          sources: [],
          cached: false 
        },
        { status: 200 }
      );
    }

    // Quick Win #6: Use Redis cache for frequently searched queries
    const cacheKey = `rag:${trimmedQuery.toLowerCase().slice(0, 100)}`;
    const ragResult = await getCachedData(
      cacheKey,
      () => getAIChatContext(trimmedQuery),
      1800 // Cache for 30 minutes
    );

    // Return compact context optimized for voice responses
    return NextResponse.json(
      {
        context: ragResult.context,
        sources: ragResult.sources.slice(0, 3).map(s => ({
          id: s.id,
          type: s.metadata?.chunk_type,
          score: s.score,
        })),
        relevanceScore: ragResult.relevanceScore,
        cached: true,
      },
      {
        // Quick Win #4: Add Cache-Control headers
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'CDN-Cache-Control': 'public, s-maxage=1800',
        },
      }
    );

  } catch (error) {
    console.error("Realtime RAG API error:", error);
    
    // Return fallback context instead of failing
    return NextResponse.json({
      context: "Senior Software Engineer with 8+ years experience. Currently Full Stack Developer freelancing with React/Next.js/TypeScript/Shopify. Strong enterprise background in Java/Spring Boot, AWS, microservices at ING, Amdocs, IBM.",
      sources: [],
      relevanceScore: 0.5,
      error: "Using fallback context",
      cached: false,
    });
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    endpoint: "realtime-rag",
    description: "Fast RAG search for OpenAI Realtime API voice conversations"
  });
}
