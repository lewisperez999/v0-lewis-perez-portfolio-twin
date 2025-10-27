"use server"
import { z } from "zod"
import { tool, stepCountIs } from "ai"
import { getAIChatContext, searchVectors, type SearchResult } from "@/lib/vector-search"
import { logConversation } from "@/app/admin/actions/conversation-logs"

// No need to import OpenAI provider when using Vercel AI Gateway
// The AI SDK will automatically use the gateway when model is specified as string

/**
 * Get the AI model from environment variable with fallback
 * Supports any model available through Vercel AI Gateway
 * Examples: "openai/gpt-4o", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.1-70b-instruct"
 */
function getAIModel(): string {
  const model = process.env.AI_MODEL || "openai/gpt-4o"
  console.log(`Using AI model: ${model}`) // Helpful for debugging
  return model
}

// Schema for conversation message
const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.date().optional(),
  sources: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        type: z.string().optional(),
        relevanceScore: z.number(),
      }),
    )
    .optional(),
})

export type Message = z.infer<typeof MessageSchema>

// Schema for chat session
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ChatSessionSchema = z.object({
  id: z.string(),
  messages: z.array(MessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ChatSession = z.infer<typeof ChatSessionSchema>

// Enhanced options for AI response generation
interface AIResponseOptions {
  model?: string
  includeSources?: boolean
  responseFormat?: "detailed" | "concise" | "technical" | "conversational"
  maxLength?: number
  personaEnhancement?: string
  userName?: string
}
/**
 * Create Vercel AI SDK tools from tool handlers
 * LLM decides when to use these tools - no pre-fetching
 */
async function createAiSdkTools(): Promise<Record<string, any>> {
  const { toolHandlers } = await import('@/lib/realtime-tools')
  
  // AI SDK v5 - tool definitions must use tool() helper
  return {
    search_professional_content: tool({
      description: "CRITICAL: Use this tool for ANY question about Lewis's background. Searches ALL professional content including: work experience at companies (ING, Amdocs, IBM), technical skills (React, Next.js, Java, Spring Boot, AWS, PostgreSQL), portfolio projects (e-commerce, Shopify, web applications), achievements, and education.",
      inputSchema: z.object({
        query: z.string().describe("The search query - use the user's exact question or key terms")
      }),
      execute: async ({ query }) => {
        return await toolHandlers.search_professional_content({ query })
      }
    }),
    
    get_detailed_experience: tool({
      description: "Get detailed information about Lewis's work experience at specific companies",
      inputSchema: z.object({
        company: z.string().optional().describe("Optional company name to filter by")
      }),
      execute: async ({ company }) => {
        return await toolHandlers.get_detailed_experience({ company })
      }
    }),
    
    get_technical_skills: tool({
      description: "Get Lewis's technical skills organized by category with proficiency levels",
      inputSchema: z.object({
        category: z.string().optional().describe("Optional skill category to filter by")
      }),
      execute: async ({ category }) => {
        return await toolHandlers.get_technical_skills({ category })
      }
    }),

    get_conversation_context: tool({
      description: "Get contextual information based on the conversation topic using RAG",
      inputSchema: z.object({
        topic: z.string().describe("The topic or question to get relevant context for")
      }),
      execute: async ({ topic }): Promise<any> => {
        return await toolHandlers.get_conversation_context({ topic })
      }
    })
  }
}

/**
 * Extract sources from tool results across all steps
 */
function extractSourcesFromToolResults(steps: any[]): SearchResult[] {
  const sources: SearchResult[] = []
  
  for (const step of steps) {
    for (const toolResult of step.toolResults || []) {
      if (toolResult.toolName === 'search_professional_content' || 
          toolResult.toolName === 'get_conversation_context') {
        const result = toolResult.result as any
        if (result.sources) {
          sources.push(...result.sources)
        }
      }
    }
  }
  
  return sources
}

/**
 * Generate AI response with tool calling
 * LLM decides when to use tools - no pre-fetching
 */
export async function generateAIResponse(
  userMessage: string, 
  conversationHistory: Message[] = [],
  sessionId?: string,
  options?: AIResponseOptions
) {
  const startTime = Date.now()
  let context = ""
  let sources: SearchResult[] = []
  
  try {
    if (!process.env.AI_GATEWAY_API_KEY) {
      // No AI Gateway API key - fallback to RAG-first approach
      console.log('⚠️  No AI Gateway API key, using legacy RAG-first approach')
      
      try {
        const contextResult = await getAIChatContext(userMessage)
        context = contextResult.context
        sources = contextResult.sources
      } catch (error) {
        context = "Senior Software Engineer with 8+ years experience. Currently Full Stack Developer freelancing with React/Next.js/Shopify. Strong enterprise background in Java/Spring Boot, AWS, and database optimization at companies like ING and Amdocs."
      }
      
      const mockResult = generateMockResponse(userMessage, context, sources)
      
      // Log the conversation with enhanced database logging
      const responseTime = Date.now() - startTime
      await logConversation(
        userMessage, 
        mockResult.response, 
        "answered", 
        responseTime,
        sessionId, // Use provided session ID or undefined for backward compatibility
        "mock-response", // modelUsed
        sources, // vectorSources
        context // contextUsed
      )
      
      return mockResult
    }

    // Use Vercel AI SDK with tool calling
    console.log('🤖 Using tool calling - LLM will decide when to search')
    try {
      const { generateText } = await import("ai")
      
      // Create AI SDK tools
      const aiSdkTools = await createAiSdkTools()
      
      // Build messages WITHOUT pre-fetched context (let LLM decide when to search)
      const messages = await buildMessages(
        userMessage, 
        conversationHistory, 
        "", // No pre-fetched context - LLM uses tools when needed
        options?.personaEnhancement, 
        options?.userName
      )

      const result = await generateText({
        model: options?.model || getAIModel(),
        messages: messages,
        temperature: 0.7,
        tools: aiSdkTools,
        stopWhen: stepCountIs(5) // Stop after max 5 steps - allows LLM to use tools then respond
      })

      // Extract sources from tool results
      const sources = extractSourcesFromToolResults((result as any).steps || [])
      
      // Count tool usage
      const allSteps = (result as any).steps || []
      const totalToolCalls = allSteps.reduce((acc: number, step: any) => acc + (step.toolCalls?.length || 0), 0)
      const toolsUsedList = allSteps
        .flatMap((step: any) => step.toolCalls || [])
        .map((tc: any) => tc.toolName)
      
      // Build context summary from tool results for logging
      const contextUsed = allSteps
        .flatMap((step: any) => step.toolResults || [])
        .map((tr: any) => `${tr.toolName}`)
        .join(', ') || 'none'

      // Log final summary
      if (totalToolCalls > 0) {
        console.log('📊 FINAL SUMMARY - Tools Used:', {
          totalToolCalls,
          uniqueTools: [...new Set(toolsUsedList)],
          sourcesFound: sources.length
        })
      } else {
        console.log('📊 FINAL SUMMARY - Direct Response (No Tools)')
      }

      const response = {
        response: result.text,
        sources: options?.includeSources !== false ? sources.map((s) => ({
          id: s.id,
          title: s.metadata?.title || s.metadata?.chunk_type || "Professional Content",
          type: s.metadata?.chunk_type || "content",
          relevanceScore: s.score,
        })) : [],
        metadata: {
          model: options?.model || getAIModel(),
          responseFormat: options?.responseFormat || "detailed",
          sessionId: sessionId,
          toolCallsCount: totalToolCalls,
          toolsUsed: toolsUsedList
        }
      }

      // Log successful conversation
      const responseTime = Date.now() - startTime
      await logConversation(
        userMessage, 
        result.text, 
        "answered", 
        responseTime,
        sessionId,
        options?.model || getAIModel(),
        sources,
        contextUsed // Tools used instead of pre-fetched context
      )

      return response
    } catch (aiError) {
      // AI generation failed, using mock response
      const mockResult = generateMockResponse(userMessage, context, sources)
      
      // Log failed attempt with fallback
      const responseTime = Date.now() - startTime
      await logConversation(
        userMessage, 
        mockResult.response, 
        "failed", 
        responseTime,
        undefined, // sessionId
        getAIModel(), // modelUsed
        sources, // vectorSources
        context // contextUsed
      )
      
      return mockResult
    }
  } catch (error) {
    console.error("AI response error:", error)
    const fallbackResult = generateMockResponse(userMessage, "", [])
    
    // Log error case with enhanced database logging
    const responseTime = Date.now() - startTime
    await logConversation(
      userMessage, 
      fallbackResult.response, 
      "failed", 
      responseTime,
      undefined, // sessionId
      "error-fallback", // modelUsed
      [], // vectorSources
      "" // contextUsed
    )
    
    return fallbackResult
  }
}

/**
 * Create a summary of older conversation messages to maintain context
 */
async function createConversationSummary(messages: Message[]): Promise<string> {
  try {
    if (messages.length === 0) return ""

    // Check if conversation summary is enabled
    const summaryEnabled = process.env.ENABLE_CONVERSATION_SUMMARY?.toLowerCase() === 'true'
    if (!summaryEnabled) {
      return "Previous conversation covered professional background topics."
    }

    // Try AI-powered summarization if available
    if (process.env.AI_GATEWAY_API_KEY) {
      try {
        const { generateText } = await import("ai")
        
        const conversationText = messages
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n')
          .slice(0, 2000) // Limit input size

        const result = await generateText({
          model: getAIModel(),
          prompt: `Summarize this conversation between a user and Lewis Perez (Software Engineer) in 2-3 sentences, focusing on key topics discussed and main points covered. Keep it concise and relevant for maintaining conversation context.

Conversation:
${conversationText}`,
          temperature: 0.3,
        })

        return result.text.slice(0, 300) // Limit summary length
      } catch (error) {
        console.log('AI summarization failed, using fallback:', error)
      }
    }

    // Fallback to simple summarization
    const userQuestions = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .slice(0, 5) // Limit to first 5 questions for summary

    const assistantResponses = messages
      .filter(msg => msg.role === 'assistant')
      .map(msg => msg.content.slice(0, 200)) // First 200 chars of each response
      .slice(0, 3) // Limit to first 3 responses

    // Simple summary generation
    const topics = userQuestions.join(', ')
    const keyPoints = assistantResponses.join(' ... ')

    return `Topics discussed: ${topics}. Key points covered: ${keyPoints.slice(0, 500)}...`
  } catch (error) {
    console.error('Error creating conversation summary:', error)
    return "Previous conversation covered professional background and experience."
  }
}

async function buildMessages(userMessage: string, conversationHistory: Message[], context: string, personaEnhancement?: string, userName?: string) {
  // Create greeting based on whether we have the user's name
  const greeting = userName ? `Hi ${userName}!` : "Hi!";
  
  let systemPrompt = `You are Lewis Perez, a Senior Software Engineer.

${userName ? `When greeting, address the user as ${userName} (e.g., "${greeting}").` : 'Be friendly and professional.'}

CRITICAL RULES:
1. ALWAYS use search_professional_content tool for ANY question about background, experience, projects, or skills
2. NEVER invent or assume details - only use information from tool results
3. If tools return no results, say "I don't have specific information about that in my records"
4. ONLY respond without tools for greetings like "hi" or "hello"

AVAILABLE TOOLS:
- search_professional_content: Primary tool - use for all background questions
- get_detailed_experience: Specific company details
- get_technical_skills: Skills by category
- get_conversation_context: Follow-up questions${context ? `\n\nCONTEXT:\n${context}` : ''}`

  // Add persona enhancement if provided (for AI-to-AI conversations)
  if (personaEnhancement) {
    systemPrompt += `\n\nADDITIONAL: ${personaEnhancement}`
  }

  // Get conversation limit from environment variable with fallback to 6
  const conversationLimit = parseInt(process.env.CONVERSATION_LIMIT || "6", 10)
  
  // Ensure the limit is reasonable (between 2 and 50)
  const safeLimit = Math.max(2, Math.min(conversationLimit, 50))
  
  console.log(`Using conversation limit: ${safeLimit} messages`)

  // Handle conversation continuity when limit is exceeded
  let messagesToInclude = conversationHistory
  let conversationSummary = ""

  if (conversationHistory.length > safeLimit) {
    // Get older messages that will be truncated
    const olderMessages = conversationHistory.slice(0, -(safeLimit - 1))
    const recentMessages = conversationHistory.slice(-(safeLimit - 1))

    // Create summary of older conversation
    if (olderMessages.length > 0) {
      conversationSummary = await createConversationSummary(olderMessages)
    }

    messagesToInclude = recentMessages
  }

  // Build system prompt with conversation summary if available
  const enhancedSystemPrompt = conversationSummary 
    ? `${systemPrompt}

CONVERSATION CONTEXT:
Earlier in our conversation, we discussed: ${conversationSummary}

Please maintain continuity with this previous conversation context while responding to the current question.`
    : systemPrompt

  return [
    { role: "system" as const, content: enhancedSystemPrompt },
    ...messagesToInclude.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: userMessage },
  ]
}

function generateMockResponse(userMessage: string, context: string, sources: SearchResult[]) {
  // Generate contextual responses based on common question patterns
  const messageLower = userMessage.toLowerCase()

  if (messageLower.includes("experience") || messageLower.includes("background")) {
    return {
      response: `Thanks for asking about my experience! I'm Lewis Perez, a Senior Software Engineer with over 8 years of experience in enterprise development. I've worked at companies like ING Australia and Amdocs, where I specialized in Java/Spring Boot development and database optimization. At ING, I led initiatives that reduced API response times from 500ms to 200ms and achieved 95% code coverage through automated testing frameworks. I'm passionate about building scalable systems and mentoring development teams.`,
      sources: sources.map((s) => ({
        id: s.id,
        title: s.metadata?.title || "Professional Experience",
        type: s.metadata?.chunk_type || "experience",
        relevanceScore: s.score,
      })),
    }
  }

  if (messageLower.includes("skills") || messageLower.includes("technology") || messageLower.includes("tech")) {
    return {
      response: `My core technical expertise centers around Java and Spring Boot development, with extensive experience in database optimization using PostgreSQL and Redis. I'm proficient in AWS cloud services, microservices architecture, and DevOps practices. I also have experience with frontend technologies like React and Next.js, as you can see from this portfolio! I'm always learning new technologies and currently exploring AI/ML applications in software development.`,
      sources: sources.map((s) => ({
        id: s.id,
        title: s.metadata?.title || "Technical Skills",
        type: s.metadata?.chunk_type || "skills",
        relevanceScore: s.score,
      })),
    }
  }

  if (messageLower.includes("project") || messageLower.includes("work")) {
    return {
      response: `I've worked on several impactful projects throughout my career. At ING, I led the development of microservices that handle millions of transactions daily. I also built a comprehensive e-commerce platform using Next.js and Shopify integration with real-time inventory management. Currently, I'm working on freelance projects while pursuing advanced studies in Melbourne. Each project has taught me valuable lessons about scalability, performance optimization, and team collaboration.`,
      sources: sources.map((s) => ({
        id: s.id,
        title: s.metadata?.title || "Projects",
        type: s.metadata?.chunk_type || "projects",
        relevanceScore: s.score,
      })),
    }
  }

  // Default response
  return {
    response: `Thank you for your question: "${userMessage}". I'm Lewis Perez, a Senior Software Engineer with 8+ years of experience specializing in Java/Spring Boot development and database optimization. I'd be happy to discuss my background, technical expertise, or any specific aspects of my experience you're interested in. Feel free to ask about my work at companies like ING and Amdocs, my technical projects, or my approach to software development!`,
    sources: sources.map((s) => ({
      id: s.id,
      title: s.metadata?.title || "Professional Content",
      type: s.metadata?.chunk_type || "content",
      relevanceScore: s.score,
    })),
  }
}

/**
 * Search professional content based on query
 */
export async function searchProfessionalContent(query: string) {
  try {
    const results = await searchVectors(query, {
      topK: 10,
      minSimilarityScore: 0.6,
      includeMetadata: true,
    })

    return {
      results,
      query,
      totalResults: results.length,
    }
  } catch (error) {
    console.error("Search error:", error)
    throw new Error("Failed to search professional content")
  }
}

/**
 * Get suggested questions based on available content
 */
export async function getSuggestedQuestions() {
    try {
      if (!process.env.AI_GATEWAY_API_KEY) {
        return [
          "What's your experience with React and Next.js development?",
          "Can you tell me about your current full-stack freelance work?",
          "How do you combine enterprise Java experience with modern web development?",
          "What was your most challenging project at ING or in your freelance work?",
          "How do you approach building e-commerce solutions with Shopify?",
          "Can you describe your experience with TypeScript and modern JavaScript?",
        ]
      }    // Try to get context and generate dynamic questions
    let context = ""
    try {
      const contextResult = await getAIChatContext("professional experience skills achievements")
      context = contextResult.context
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.log("Using fallback context for questions", error)
      context =
        "Senior Software Engineer with 8+ years experience. Currently Full Stack Developer freelancing with React/Next.js/TypeScript/Shopify. Strong enterprise background in Java/Spring Boot, AWS, microservices at ING, Amdocs, IBM. Expert in both modern web development and enterprise systems."
    }

    const { generateObject } = await import("ai")

    const result = await generateObject({
      model: getAIModel(),
      prompt: `Based on this professional background context, generate 6 engaging questions that would showcase the person's expertise and experience. Make them specific and likely to yield interesting answers.

Context: ${context.slice(0, 2000)}

Generate questions that cover:
- Technical expertise and specific technologies
- Notable achievements and metrics
- Project experiences and challenges solved
- Leadership and collaboration
- Industry-specific knowledge
- Career growth and learning

Format as a JSON array of question strings.`,
      schema: z.object({
        questions: z.array(z.string()).length(6),
      }),
    })

    return result.object.questions
  } catch (error) {
    console.error("Error generating suggested questions:", error)

    // Fallback questions if AI generation fails
    return [
      "What's your experience with React and Next.js development?",
      "Can you tell me about your current full-stack freelance work?",
      "How do you combine enterprise Java experience with modern web development?",
      "What was your most challenging project at ING or in your freelance work?",
      "How do you approach building e-commerce solutions with Shopify?",
      "Can you describe your experience with TypeScript and modern JavaScript?",
    ]
  }
}

/**
 * Validate user input
 */
export async function validateUserInput(input: string) {
  try {
    // Simple validation for now
    const validation = {
      isValid: input.trim().length > 0 && input.trim().length <= 1000,
      sanitizedInput: input.trim(),
      suggestions: [] as string[],
    }

    if (!validation.isValid) {
      validation.suggestions.push("Please enter a question between 1 and 1000 characters")
    }

    return validation
  } catch (error) {
    console.error("Input validation error:", error)

    return {
      isValid: false,
      sanitizedInput: "",
      suggestions: ["Please try again with a valid question"],
    }
  }
}

/**
 * Summarize conversation for context management
 */
export async function summarizeConversation(messages: Message[]) {
  try {
    // Simple summary for now
    return {
      summary: `Conversation with ${messages.length} messages about professional background and experience.`,
      keyTopics: ["professional experience", "technical skills", "career achievements"],
      lastActivity: new Date(),
    }
  } catch (error) {
    console.error("Conversation summary error:", error)

    return {
      summary: "Unable to summarize conversation",
      keyTopics: [],
      lastActivity: new Date(),
    }
  }
}
