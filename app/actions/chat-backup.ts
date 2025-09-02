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