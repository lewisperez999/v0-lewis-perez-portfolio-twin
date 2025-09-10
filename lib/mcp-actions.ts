import { query } from '@/lib/database';
import type { Message } from '@/app/actions/chat';

// Helper functions for AI chat conversation
export async function createOrUpdateSession(sessionId: string, conversationType: string, persona?: string, aiModel?: string) {
  try {
    // Check if session exists
    const existingSession = await query('SELECT session_id FROM ai_chat_sessions WHERE session_id = $1', [sessionId]);
    
    if (existingSession.length === 0) {
      // Create new session
      await query(`
        INSERT INTO ai_chat_sessions (session_id, conversation_type, persona, ai_model, metadata)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        sessionId,
        conversationType,
        persona || 'curious_explorer',
        aiModel || 'openai/gpt-4o',
        JSON.stringify({ created_via: 'mcp_tool' })
      ]);
    } else {
      // Update existing session
      await query(`
        UPDATE ai_chat_sessions 
        SET last_activity = NOW(), message_count = message_count + 1
        WHERE session_id = $1
      `, [sessionId]);
    }
  } catch (error) {
    console.error('Error managing session:', error);
    // Continue anyway - don't fail the conversation
  }
}

export async function getAIChatHistory(sessionId: string): Promise<Message[]> {
  try {
    const result = await query(`
      SELECT user_message, ai_response, created_at
      FROM conversations 
      WHERE session_id = $1 
      ORDER BY created_at ASC
      LIMIT 20
    `, [sessionId]);
    
    const messages: Message[] = [];
    result.forEach((row: any) => {
      messages.push({
        id: `user_${row.created_at}`,
        role: 'user',
        content: row.user_message,
        timestamp: new Date(row.created_at)
      });
      messages.push({
        id: `assistant_${row.created_at}`,
        role: 'assistant',
        content: row.ai_response,
        timestamp: new Date(row.created_at)
      });
    });
    
    return messages;
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return [];
  }
}

export function enhanceMessageWithPersona(message: string, persona?: string, conversationType?: string, context?: string): string {
  const personaEnhancements = {
    interviewer: "You are being interviewed by a professional recruiter. Provide detailed, specific examples of your experience and achievements. Be professional but personable.",
    technical_assessor: "You are being assessed by a senior technical expert. Provide deep technical details, explain your decision-making process, and demonstrate your technical expertise.",
    curious_explorer: "You are talking with someone genuinely interested in learning about your professional journey. Be open, share insights, and provide context for your experiences.",
    analyst: "You are being analyzed by a professional analyst. Provide comprehensive information that allows for thorough evaluation of your skills, experience, and professional trajectory."
  };
  
  let enhancedMessage = message;
  
  if (context) {
    enhancedMessage = `Context: ${context}\n\nQuestion: ${message}`;
  }
  
  if (persona && personaEnhancements[persona as keyof typeof personaEnhancements]) {
    enhancedMessage = `${personaEnhancements[persona as keyof typeof personaEnhancements]}\n\n${enhancedMessage}`;
  }
  
  return enhancedMessage;
}

export async function updateConversationHistory(sessionId: string, userMessage: string, aiResponse: string): Promise<Message[]> {
  // The conversation is already logged by generateAIResponse, so we just need to return the updated history
  return await getAIChatHistory(sessionId);
}

export async function generateFollowUpQuestions(response: string, conversationType: string, persona?: string): Promise<string[]> {
  const followUpPatterns = {
    interview: [
      "Can you give me a specific example of when you...",
      "How did you handle the situation when...",
      "What was the outcome of...",
      "Tell me about a time when you faced..."
    ],
    assessment: [
      "What were the technical challenges with...",
      "How did you optimize...",
      "What alternatives did you consider for...",
      "Walk me through your approach to..."
    ],
    exploration: [
      "That's interesting, can you tell me more about...",
      "What led you to...",
      "How did that experience shape...",
      "What did you learn from..."
    ],
    analysis: [
      "Based on your experience, how would you evaluate...",
      "What patterns do you see in...",
      "How has your approach evolved...",
      "What metrics would you use to measure..."
    ]
  };
  
  const patterns = followUpPatterns[conversationType as keyof typeof followUpPatterns] || followUpPatterns.exploration;
  
  // Extract key topics from the response to create contextual follow-ups
  const topics = extractTopics(response);
  const technologies = extractTechnologies(response);
  
  const suggestions: string[] = [];
  
  // Add topic-based follow-ups
  if (topics.length > 0) {
    suggestions.push(`${patterns[0]} ${topics[0]}?`);
  }
  
  // Add technology-based follow-ups
  if (technologies.length > 0) {
    suggestions.push(`${patterns[1]} ${technologies[0]}?`);
  }
  
  // Add a general follow-up
  suggestions.push(patterns[2]);
  
  return suggestions.slice(0, 3);
}

export async function logAIConversationAnalytics(sessionId: string, analytics: any) {
  try {
    await query(`
      INSERT INTO ai_conversation_analytics (
        session_id, conversation_turn, question_type, response_quality_score,
        technical_depth_score, topics_mentioned, technologies_discussed,
        sources_utilized, response_time_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      sessionId,
      analytics.conversation_turn,
      analytics.question_type,
      analytics.response_quality_score,
      analytics.technical_depth_score,
      analytics.topics_mentioned,
      analytics.technologies_discussed,
      analytics.sources_utilized,
      analytics.response_time_ms
    ]);
  } catch (error) {
    console.error('Error logging analytics:', error);
    // Continue anyway - don't fail the conversation
  }
}

export function extractTopics(text: string): string[] {
  // Simple topic extraction - could be enhanced with NLP
  const topicKeywords = [
    'java', 'spring', 'microservices', 'database', 'api', 'performance', 'optimization',
    'architecture', 'design', 'development', 'testing', 'deployment', 'cloud', 'aws',
    'docker', 'kubernetes', 'postgresql', 'elasticsearch', 'monitoring', 'leadership',
    'team', 'project', 'agile', 'scrum', 'devops', 'ci/cd', 'automation'
  ];
  
  const found = topicKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return found.slice(0, 5); // Return top 5 topics
}

export function extractTechnologies(text: string): string[] {
  // Extract technology mentions
  const techKeywords = [
    'Java', 'Spring Boot', 'PostgreSQL', 'ElasticSearch', 'Docker', 'Kubernetes',
    'AWS', 'React', 'TypeScript', 'Node.js', 'Python', 'REST', 'GraphQL',
    'Redis', 'MongoDB', 'MySQL', 'Jenkins', 'Git', 'Jira', 'Maven', 'Gradle'
  ];
  
  const found = techKeywords.filter(tech => 
    text.includes(tech)
  );
  
  return found.slice(0, 5); // Return top 5 technologies
}

export function formatAIConversationResponse(aiResponse: any, options: any): string {
  const { sessionId, conversationType, persona, responseFormat, followUpQuestions, conversationTurn } = options;
  
  let formatted = `**AI Portfolio Response** (Turn ${conversationTurn})\n\n`;
  formatted += `${aiResponse.response}\n\n`;
  
  if (aiResponse.sources && aiResponse.sources.length > 0) {
    formatted += `**Sources Consulted:**\n`;
    aiResponse.sources.forEach((source: any, index: number) => {
      formatted += `${index + 1}. ${source.title || source.type} (Relevance: ${(source.relevanceScore * 100).toFixed(1)}%)\n`;
    });
    formatted += '\n';
  }
  
  if (followUpQuestions && followUpQuestions.length > 0) {
    formatted += `**Suggested Follow-up Questions:**\n`;
    followUpQuestions.forEach((question: string, index: number) => {
      formatted += `${index + 1}. ${question}\n`;
    });
    formatted += '\n';
  }
  
  formatted += `*Session: ${sessionId} | Type: ${conversationType} | Persona: ${persona || 'default'}*`;
  
  return formatted;
}