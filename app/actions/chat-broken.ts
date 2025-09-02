'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { streamText, generateObject } from 'ai'
import { z } from 'zod'
import { getAIChatContext, searchVectors, SearchResult } from '@/lib/vector-search'

// Configure OpenAI provider based on API key type
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  // Use Vercel's AI endpoint if using a Vercel Consumer Key
  ...(process.env.OPENAI_API_KEY?.startsWith('vck_') && {
    baseURL: 'https://api.vercel.com/v1/ai'
  })
})

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
    // Temporary fallback while API key issue is resolved
    return {
      response: `Thank you for your question: "${userMessage}". 

I'm Lewis Perez, a Senior Software Engineer with 8+ years of experience. While I'm currently working on setting up the full AI integration for this chat, I'd be happy to tell you about my background:

• I specialize in Java/Spring Boot development and database optimization
• I've worked at companies like ING and Amdocs on large-scale enterprise systems
• My expertise includes system architecture, performance tuning, and team leadership
• I have experience with cloud technologies, microservices, and DevOps practices

For detailed information about my experience and projects, please check out the other sections of my portfolio above, or feel free to contact me directly!

The AI-powered chat with full context retrieval will be available soon.`,
      sources: []
    }
  } catch (error) {
    console.error('AI response error:', error)
    
    return {
      response: "I apologize, but I'm having trouble with my AI assistant right now. Please feel free to explore the other sections of my portfolio to learn about my experience, or contact me directly!",
      sources: []
    }
  }
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

    // Generate streaming response
    const { textStream } = await streamText({
      model: openai('gpt-4o'),
      messages,
      temperature: 0.7,
    })

    // Collect the full response
    let fullResponse = ''
    for await (const delta of textStream) {
      fullResponse += delta
    }

    return {
      response: fullResponse,
      sources: sources.map(source => ({
        id: source.id,
        title: source.metadata.title || 'Professional Information',
        type: source.metadata.chunk_type || 'general',
        relevanceScore: source.score,
      })),
      relevanceScore
    }
  } catch (error) {
    console.error('Error generating AI response:', error)
    throw new Error('Failed to generate response')
  }
}

/**
 * Search professional content with natural language
 */
export async function searchProfessionalContent(query: string) {
  try {
    const results = await searchVectors(query, {
      topK: 8,
      minSimilarityScore: 0.6,
      includeMetadata: true
    })

    return {
      results: results.map(result => ({
        id: result.id,
        title: result.metadata.title || 'Professional Information',
        content: result.content,
        type: result.metadata.chunk_type || 'general',
        importance: result.metadata.importance || 'medium',
        relevanceScore: result.score,
      })),
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
    // Return static questions for now while API key issue is resolved
    return [
      "What's your experience with Java and Spring Boot development?",
      "Can you tell me about your database optimization achievements?",
      "What was your most challenging project at ING or Amdocs?",
      "How do you approach system performance improvements?",
      "What's your experience with cloud technologies and AWS?",
      "Can you describe your leadership and mentoring experience?"
    ]
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
 * Validate user input for safety and relevance
 */
export async function validateUserInput(input: string): Promise<{
  isValid: boolean
  reason?: string
  suggestedRephrase?: string
}> {
  try {
    // Basic validation
    if (!input || input.trim().length === 0) {
      return { isValid: false, reason: 'Please enter a question' }
    }

    if (input.length > 500) {
      return { 
        isValid: false, 
        reason: 'Question is too long. Please keep it under 500 characters.' 
      }
    }

    // Check if question is professional/relevant
    const result = await generateObject({
      model: openai('gpt-4o'),
      prompt: `Analyze this question for a professional portfolio chat: "${input}"

Determine if it's:
1. Professional and appropriate for a job interview or career discussion
2. Relevant to software engineering, career, or professional topics
3. Something that can be answered by a senior software engineer's background

If not appropriate, suggest a professional rephrase.`,
      schema: z.object({
        isAppropriate: z.boolean(),
        isRelevant: z.boolean(),
        reason: z.string().optional(),
        suggestedRephrase: z.string().optional()
      })
    })

    const { isAppropriate, isRelevant, reason, suggestedRephrase } = result.object

    if (!isAppropriate || !isRelevant) {
      return {
        isValid: false,
        reason: reason || 'Please ask questions related to professional experience, skills, or career',
        suggestedRephrase
      }
    }

    return { isValid: true }
  } catch (error) {
    console.error('Input validation error:', error)
    // Default to allowing the input if validation fails
    return { isValid: true }
  }
}

/**
 * Get conversation context summary for long conversations
 */
export async function summarizeConversation(messages: Message[]): Promise<string> {
  try {
    if (messages.length <= 4) {
      return '' // No need to summarize short conversations
    }

    const conversationText = messages
      .slice(0, -2) // Don't include the last 2 messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    const result = await generateObject({
      model: openai('gpt-4o'),
      prompt: `Summarize this conversation between a user and Lewis Perez (Senior Software Engineer) in 2-3 sentences. Focus on the key topics discussed and any specific technical areas explored.

Conversation:
${conversationText}`,
      schema: z.object({
        summary: z.string()
      })
    })

    return result.object.summary
  } catch (error) {
    console.error('Conversation summary error:', error)
    return ''
  }
}