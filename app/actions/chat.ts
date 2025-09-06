"use server"
import { z } from "zod"
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
}

/**
 * Generate AI response with RAG context
 * Enhanced for MCP AI-to-AI conversations while maintaining backward compatibility
 */
export async function generateAIResponse(
  userMessage: string, 
  conversationHistory: Message[] = [],
  sessionId?: string,
  options?: AIResponseOptions
) {
  const startTime = Date.now()
  
  try {
    // Get relevant context from vector search (with fallback)
    let context = ""
    let sources: SearchResult[] = []
    let relevanceScore = 0

    try {
      const contextResult = await getAIChatContext(userMessage)
      context = contextResult.context
      sources = contextResult.sources
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      relevanceScore = contextResult.relevanceScore
    } catch (error) {
      console.log("Vector search failed, continuing without context:", error)
      context =
        "Professional software engineer with expertise in Java/Spring Boot, database optimization, and enterprise systems."
    }

    if (!process.env.AI_GATEWAY_API_KEY) {
      console.log("No AI Gateway API key available, using mock response")
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

    // Use Vercel AI Gateway with configurable model
    let result
    try {
      const { generateText } = await import("ai")

      result = await generateText({
        model: options?.model || getAIModel(), // Use provided model or default
        messages: await buildMessages(userMessage, conversationHistory, context, options?.personaEnhancement),
        temperature: 0.7,
      })

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
          sessionId: sessionId
        }
      }

      // Log successful conversation with enhanced database logging
      const responseTime = Date.now() - startTime
      await logConversation(
        userMessage, 
        result.text, 
        "answered", 
        responseTime,
        sessionId, // Use provided session ID or undefined for backward compatibility
        options?.model || getAIModel(), // modelUsed
        sources, // vectorSources
        context // contextUsed
      )

      return response
    } catch (aiError) {
      console.log("AI generation failed, using mock response:", aiError)
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

async function buildMessages(userMessage: string, conversationHistory: Message[], context: string, personaEnhancement?: string) {
  let systemPrompt = `You are Lewis Perez, a Senior Software Engineer with 8+ years of experience. You are responding to questions about your professional background, skills, and experience.

IMPORTANT GUIDELINES:
- Always respond in first person as Lewis Perez
- Use the provided context to give accurate, specific answers
- Include specific examples, metrics, and achievements when relevant
- Maintain a professional yet personable tone
- If asked about something not in your background, politely clarify your actual experience
- Reference specific companies, technologies, and projects mentioned in the context
- Keep responses focused and relevant to the question asked

CONTEXT FROM YOUR PROFESSIONAL BACKGROUND:
${context}

If the context doesn't contain relevant information for the question, politely explain what you can help with based on your actual experience in software engineering, particularly in Java/Spring Boot, database optimization, and enterprise system development.`

  // Add persona enhancement if provided (for AI-to-AI conversations)
  if (personaEnhancement) {
    systemPrompt += `\n\nADDITIONAL CONTEXT: ${personaEnhancement}`
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
        "What's your experience with Java and Spring Boot development?",
        "Can you tell me about your database optimization achievements?",
        "What was your most challenging project at ING?",
        "How do you approach system performance improvements?",
        "What's your experience with cloud technologies and AWS?",
        "Can you describe your leadership and mentoring experience?",
      ]
    }

    // Try to get context and generate dynamic questions
    let context = ""
    try {
      const contextResult = await getAIChatContext("professional experience skills achievements")
      context = contextResult.context
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.log("Using fallback context for questions", error)
      context =
        "Senior Software Engineer with Java/Spring Boot expertise, database optimization experience, and enterprise system development background."
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
      "What's your experience with Java and Spring Boot development?",
      "Can you tell me about your database optimization achievements?",
      "What was your most challenging project at ING or Amdocs?",
      "How do you approach system performance improvements?",
      "What's your experience with cloud technologies and AWS?",
      "Can you describe your leadership and mentoring experience?",
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
