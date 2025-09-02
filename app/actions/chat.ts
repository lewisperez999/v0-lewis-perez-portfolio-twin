'use server'

import { generateText, generateObject } from 'ai'
import { z } from 'zod'
import { getAIChatContext, searchVectors, SearchResult } from '@/lib/vector-search'

// No need to import OpenAI provider when using Vercel AI Gateway
// The AI SDK will automatically use the gateway when model is specified as string

// Schema for conversation message
const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date().optional(),
  sources: z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    type: z.string().optional(),
    relevanceScore: z.number(),
  })).optional(),
})

export type Message = z.infer<typeof MessageSchema>

// Schema for chat session
const ChatSessionSchema = z.object({
  id: z.string(),
  messages: z.array(MessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ChatSession = z.infer<typeof ChatSessionSchema>

/**
 * Generate AI response with RAG context
 */
export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Message[] = []
) {
  try {
    // Get relevant context from vector search (with fallback)
    let context = ''
    let sources: SearchResult[] = []
    let relevanceScore = 0

    try {
      const contextResult = await getAIChatContext(userMessage)
      context = contextResult.context
      sources = contextResult.sources
      relevanceScore = contextResult.relevanceScore
    } catch (error) {
      console.log('Vector search failed, continuing without context:', error)
      context = 'Professional software engineer with expertise in Java/Spring Boot, database optimization, and enterprise systems.'
    }
    
    // Prepare conversation context
    const systemPrompt = `You are Lewis Perez, a Senior Software Engineer with 8+ years of experience. You are responding to questions about your professional background, skills, and experience.

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

    // Build conversation messages
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: userMessage }
    ]

    // Generate response using Vercel AI Gateway
    const result = await generateText({
      model: 'openai/gpt-4o', // Vercel AI Gateway automatically detects this format
      messages,
      temperature: 0.7,
    })

    return {
      response: result.text,
      sources: sources.map(s => ({
        id: s.id,
        title: s.metadata?.title || s.metadata?.chunk_type || 'Professional Content',
        type: s.metadata?.chunk_type || 'content',
        relevanceScore: s.score
      }))
    }
  } catch (error) {
    console.error('AI response error:', error)
    
    return {
      response: `Thank you for your question: "${userMessage}". 

I'm Lewis Perez, a Senior Software Engineer with 8+ years of experience. While I'm currently working on the AI integration, I'd be happy to tell you about my background:

• I specialize in Java/Spring Boot development and database optimization
• I've worked at companies like ING and Amdocs on large-scale enterprise systems
• My expertise includes system architecture, performance tuning, and team leadership
• I have experience with cloud technologies, microservices, and DevOps practices

For detailed information about my experience and projects, please check out the other sections of my portfolio above, or feel free to contact me directly!`,
      sources: []
    }
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
      includeMetadata: true
    })

    return {
      results,
      query,
      totalResults: results.length
    }
  } catch (error) {
    console.error('Search error:', error)
    throw new Error('Failed to search professional content')
  }
}

/**
 * Get suggested questions based on available content
 */
export async function getSuggestedQuestions() {
  try {
    // Try to get context and generate dynamic questions
    let context = ''
    try {
      const contextResult = await getAIChatContext('professional experience skills achievements')
      context = contextResult.context
    } catch (error) {
      console.log('Using fallback context for questions')
      context = 'Senior Software Engineer with Java/Spring Boot expertise, database optimization experience, and enterprise system development background.'
    }
    
    const result = await generateObject({
      model: 'openai/gpt-4o', // Vercel AI Gateway format
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
        questions: z.array(z.string()).length(6)
      })
    })

    return result.object.questions
  } catch (error) {
    console.error('Error generating suggested questions:', error)
    
    // Fallback questions if AI generation fails
    return [
      "What's your experience with Java and Spring Boot development?",
      "Can you tell me about your database optimization achievements?",
      "What was your most challenging project at ING or Amdocs?",
      "How do you approach system performance improvements?",
      "What's your experience with cloud technologies and AWS?",
      "Can you describe your leadership and mentoring experience?"
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
      suggestions: [] as string[]
    }

    if (!validation.isValid) {
      validation.suggestions.push("Please enter a question between 1 and 1000 characters")
    }

    return validation
  } catch (error) {
    console.error('Input validation error:', error)
    
    return {
      isValid: false,
      sanitizedInput: '',
      suggestions: ['Please try again with a valid question']
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
      keyTopics: ['professional experience', 'technical skills', 'career achievements'],
      lastActivity: new Date()
    }
  } catch (error) {
    console.error('Conversation summary error:', error)
    
    return {
      summary: 'Unable to summarize conversation',
      keyTopics: [],
      lastActivity: new Date()
    }
  }
}