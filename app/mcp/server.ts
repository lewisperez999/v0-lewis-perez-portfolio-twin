import { z } from 'zod';

// Import existing database utilities
import { query } from '@/lib/database';
import { searchVectors } from '@/lib/vector-search';

// Import enhanced chat functionality
import { generateAIResponse, type Message } from '@/app/actions/chat';

// Helper functions for AI chat conversation
async function createOrUpdateSession(sessionId: string, conversationType: string, persona?: string, aiModel?: string) {
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

async function getAIChatHistory(sessionId: string): Promise<Message[]> {
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

function enhanceMessageWithPersona(message: string, persona?: string, conversationType?: string, context?: string): string {
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

async function updateConversationHistory(sessionId: string, userMessage: string, aiResponse: string): Promise<Message[]> {
  // The conversation is already logged by generateAIResponse, so we just need to return the updated history
  return await getAIChatHistory(sessionId);
}

async function generateFollowUpQuestions(response: string, conversationType: string, persona?: string): Promise<string[]> {
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

async function logAIConversationAnalytics(sessionId: string, analytics: any) {
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

function extractTopics(text: string): string[] {
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

function extractTechnologies(text: string): string[] {
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

function formatAIConversationResponse(aiResponse: any, options: any): string {
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

// Define types for our tools
type SearchQuery = {
  query: string;
  limit?: number;
  category?: 'all' | 'experience' | 'projects' | 'skills' | 'education';
};

type ProjectQuery = {
  technology?: string;
  type?: 'web' | 'mobile' | 'api' | 'database' | 'ai/ml' | 'other';
  limit?: number;
};

type SkillQuery = {
  skill_type?: 'technical' | 'soft' | 'language' | 'certification' | 'all';
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all';
  category?: string;
};

type ExperienceQuery = {
  include_details?: boolean;
  format?: 'chronological' | 'skills_based' | 'summary';
  years?: number;
};

type ContactQuery = {
  include_social?: boolean;
  format?: 'standard' | 'business' | 'casual';
};

type AIChatQuery = {
  session_id?: string;
  conversation_type: 'interview' | 'assessment' | 'exploration' | 'analysis';
  message: string;
  context?: string;
  persona?: 'interviewer' | 'technical_assessor' | 'curious_explorer' | 'analyst';
  ai_model?: string;
  include_sources?: boolean;
  start_new_session?: boolean;
  max_conversation_length?: number;
  response_format?: 'detailed' | 'concise' | 'technical' | 'conversational';
};

// Tool definitions
export const mcpTools = {
  // Professional Search Tools
  search_professional_content: {
    name: 'search_professional_content',
    description: 'Search through professional content including experience, projects, skills, and education using semantic search',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for professional content' },
        limit: { type: 'number', default: 10, description: 'Maximum number of results to return' },
        category: { 
          type: 'string', 
          enum: ['all', 'experience', 'projects', 'skills', 'education'], 
          default: 'all', 
          description: 'Content category to search within' 
        },
      },
      required: ['query'],
    },
    handler: async ({ query: searchQuery, limit = 10, category = 'all' }: SearchQuery) => {
      try {
        // Use vector search to find relevant content
        const results = await searchVectors(searchQuery, { topK: limit });
        
        if (!results || results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No professional content found for query: "${searchQuery}"`,
              },
            ],
          };
        }

        // Format results based on category filter
        const filteredResults = category === 'all' 
          ? results 
          : results.filter((r: any) => {
              const resultCategory = r.metadata?.category || r.metadata?.chunk_type;
              return resultCategory === category;
            });

        const formattedResults = filteredResults.map((result: any) => ({
          content: result.content || result.metadata?.content || '',
          relevance: result.score,
          metadata: result.metadata,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Found ${formattedResults.length} relevant professional content items:\n\n${formattedResults.map((item: any, index: number) => 
                `${index + 1}. ${item.content}\n   Relevance: ${(item.relevance * 100).toFixed(1)}%\n   Category: ${item.metadata?.category || item.metadata?.chunk_type || 'general'}\n`
              ).join('\n')}`,
            },
          ],
        };
      } catch (error) {
        console.error('Error searching professional content:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error searching professional content: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  },

  query_projects: {
    name: 'query_projects',
    description: 'Query and filter projects by technology, type, or other criteria',
    inputSchema: {
      type: 'object',
      properties: {
        technology: { type: 'string', description: 'Filter by technology or tech stack' },
        status: { 
          type: 'string', 
          enum: ['completed', 'in-progress', 'planned', 'archived'], 
          description: 'Project status filter' 
        },
        featured: { type: 'boolean', description: 'Show only featured projects' },
        limit: { type: 'number', default: 10, description: 'Maximum number of projects to return' },
      },
      required: [],
    },
    handler: async ({ technology, status, featured, limit = 10 }: { technology?: string; status?: string; featured?: boolean; limit?: number }) => {
      try {
        let queryString = 'SELECT * FROM projects WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (technology) {
          queryString += ` AND (array_to_string(technologies, ',') ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
          params.push(`%${technology}%`);
          paramIndex++;
        }

        if (status) {
          queryString += ` AND status = $${paramIndex}`;
          params.push(status);
          paramIndex++;
        }

        if (featured !== undefined) {
          queryString += ` AND featured = $${paramIndex}`;
          params.push(featured);
          paramIndex++;
        }

        // Note: Removed type filter as 'project_type' column doesn't exist in schema
        // The projects table has: name, description, technologies, repository_url, demo_url, role, etc.

        queryString += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
        params.push(limit);

        const result = await query(queryString, params);
        
        if (!result || result.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No projects found matching the specified criteria.',
              },
            ],
          };
        }

        const projects = result.map((project: any) => ({
          title: project.name,
          description: project.description,
          technologies: project.technologies,
          url: project.demo_url,
          github: project.repository_url,
          role: project.role,
          outcomes: project.outcomes,
          challenges: project.challenges,
          documentation: project.documentation_url,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Found ${projects.length} projects:\n\n${projects.map((project: any, index: number) => 
                `${index + 1}. **${project.title}**\n   ${project.description}\n   Technologies: ${project.technologies}\n   Role: ${project.role || 'N/A'}\n   ${project.url ? `Demo: ${project.url}` : ''}${project.github ? `\n   GitHub: ${project.github}` : ''}${project.documentation ? `\n   Docs: ${project.documentation}` : ''}\n`
              ).join('\n')}`,
            },
          ],
        };
      } catch (error) {
        console.error('Error querying projects:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error querying projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  },

  lookup_skills: {
    name: 'lookup_skills',
    description: 'Retrieve skills and competencies with filtering options',
    inputSchema: {
      type: 'object',
      properties: {
        skill_type: { 
          type: 'string', 
          enum: ['technical', 'soft', 'language', 'certification', 'all'], 
          default: 'all', 
          description: 'Type of skills to retrieve' 
        },
        proficiency_level: { 
          type: 'string', 
          enum: ['beginner', 'intermediate', 'advanced', 'expert', 'all'], 
          default: 'all', 
          description: 'Minimum proficiency level' 
        },
        category: { type: 'string', description: 'Specific skill category (e.g., "programming", "frameworks", "databases")' },
      },
      required: [],
    },
    handler: async ({ skill_type = 'all', proficiency_level = 'all', category }: SkillQuery) => {
      try {
        let queryString = 'SELECT id, skill_name, category, proficiency, experience_years, context, projects, skill_type FROM skills WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (skill_type !== 'all') {
          queryString += ` AND category = $${paramIndex}`;
          params.push(skill_type);
          paramIndex++;
        }

        if (category) {
          queryString += ` AND (category ILIKE $${paramIndex} OR skill_name ILIKE $${paramIndex})`;
          params.push(`%${category}%`);
          paramIndex++;
        }

        if (proficiency_level !== 'all') {
          queryString += ` AND proficiency = $${paramIndex}`;
          params.push(proficiency_level);
          paramIndex++;
        }

        queryString += ' ORDER BY skill_name ASC';

        const result = await query(queryString, params);
        
        if (!result || result.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No skills found matching the specified criteria.',
              },
            ],
          };
        }

        const skills = result.map((skill: any) => ({
          name: skill.skill_name,
          category: skill.category,
          proficiency_level: skill.proficiency,
          experience_years: skill.experience_years,
          context: skill.context,
          projects: skill.projects,
          skill_type: skill.skill_type,
        }));

        // Group skills by category for better organization
        const skillsByCategory = skills.reduce((acc: Record<string, any[]>, skill: any) => {
          const cat = skill.category || 'Other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(skill);
          return acc;
        }, {});

        let output = `Found ${skills.length} skills:\n\n`;
        
        Object.entries(skillsByCategory).forEach(([categoryName, categorySkills]) => {
          output += `**${categoryName}:**\n`;
          (categorySkills as any[]).forEach((skill: any) => {
            output += `  • ${skill.name}`;
            if (skill.proficiency_level) {
              output += ` (${skill.proficiency_level})`;
            }
            if (skill.experience_years) {
              output += ` - ${skill.experience_years} experience`;
            }
            if (skill.context) {
              output += ` - ${skill.context}`;
            }
            output += '\n';
          });
          output += '\n';
        });

        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      } catch (error) {
        console.error('Error looking up skills:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error looking up skills: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  },

  get_experience_history: {
    name: 'get_experience_history',
    description: 'Retrieve detailed work experience and career history',
    inputSchema: {
      type: 'object',
      properties: {
        include_details: { type: 'boolean', default: true, description: 'Include detailed descriptions and achievements' },
        format: { 
          type: 'string', 
          enum: ['chronological', 'skills_based', 'summary'], 
          default: 'chronological', 
          description: 'Format for experience presentation' 
        },
        years: { type: 'number', description: 'Number of recent years to include' },
      },
      required: [],
    },
    handler: async ({ include_details = true, format = 'chronological', years }: ExperienceQuery) => {
      try {
        let queryString = 'SELECT * FROM experiences WHERE 1=1';
        const params: any[] = [];

        if (years) {
          queryString += ` AND start_date >= NOW() - INTERVAL '${years} years'`;
        }

        queryString += ' ORDER BY start_date DESC';

        const result = await query(queryString, params);
        
        if (!result || result.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No work experience found.',
              },
            ],
          };
        }

        const experiences = result.map((exp: any) => ({
          title: exp.position,
          company: exp.company,
          location: exp.location,
          startDate: exp.start_date,
          endDate: exp.end_date,
          description: exp.description,
          achievements: exp.achievements,
          technologies: exp.technologies,
        }));

        let output = '';

        switch (format) {
          case 'chronological':
            output = `Work Experience (${experiences.length} positions):\n\n`;
            experiences.forEach((exp: any, index: number) => {
              const duration = exp.endDate 
                ? `${exp.startDate} - ${exp.endDate}`
                : `${exp.startDate} - Present`;
              
              output += `${index + 1}. **${exp.title}** at **${exp.company}**\n`;
              output += `   ${duration} | ${exp.location}\n`;
              
              if (include_details && exp.description) {
                output += `   ${exp.description}\n`;
              }
              
              if (include_details && exp.achievements) {
                output += `   Key Achievements: ${exp.achievements}\n`;
              }
              
              if (exp.technologies) {
                output += `   Technologies: ${exp.technologies}\n`;
              }
              
              output += '\n';
            });
            break;

          case 'summary':
            const totalYears = experiences.length > 0 ? 
              new Date().getFullYear() - new Date(experiences[experiences.length - 1].startDate).getFullYear() : 0;
            
            output = `Career Summary:\n`;
            output += `• ${totalYears}+ years of professional experience\n`;
            output += `• ${experiences.length} positions across various companies\n`;
            output += `• Current/Recent: ${experiences[0]?.title} at ${experiences[0]?.company}\n\n`;
            
            const companies = [...new Set(experiences.map((exp: any) => exp.company))];
            output += `Companies worked for: ${companies.join(', ')}\n\n`;
            
            const allTech = experiences
              .map((exp: any) => exp.technologies)
              .filter(Boolean)
              .join(', ')
              .split(',')
              .map((t: string) => t.trim())
              .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i);
            
            if (allTech.length > 0) {
              output += `Technologies used: ${allTech.slice(0, 10).join(', ')}${allTech.length > 10 ? '...' : ''}\n`;
            }
            break;

          default:
            output = experiences.map((exp: any) => `${exp.title} at ${exp.company}`).join(', ');
        }

        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      } catch (error) {
        console.error('Error getting experience history:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error getting experience history: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  },

  get_contact_info: {
    name: 'get_contact_info',
    description: 'Retrieve contact information and professional links',
    inputSchema: {
      type: 'object',
      properties: {
        include_social: { type: 'boolean', default: true, description: 'Include social media links' },
        format: { 
          type: 'string', 
          enum: ['standard', 'business', 'casual'], 
          default: 'standard', 
          description: 'Format style for contact information' 
        },
      },
      required: [],
    },
    handler: async ({ include_social = true, format = 'standard' }: ContactQuery) => {
      try {
        const result = await query('SELECT * FROM personal_info LIMIT 1');
        
        if (!result || result.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Contact information not available.',
              },
            ],
          };
        }

        const info = result[0];
        let output = '';

        switch (format) {
          case 'business':
            output = `Professional Contact Information\n\n`;
            output += `Name: ${info.name}\n`;
            output += `Title: ${info.title}\n`;
            output += `Email: ${info.email}\n`;
            if (info.phone) output += `Phone: ${info.phone}\n`;
            if (info.location) output += `Location: ${info.location}\n`;
            if (info.website) output += `Website: ${info.website}\n`;
            break;

          case 'casual':
            output = `Hi! I'm ${info.name}\n`;
            output += `${info.bio || info.title}\n\n`;
            output += `📧 ${info.email}\n`;
            if (info.phone) output += `📱 ${info.phone}\n`;
            if (info.location) output += `📍 ${info.location}\n`;
            break;

          default: // standard
            output = `Contact Information:\n\n`;
            output += `Name: ${info.name}\n`;
            output += `Email: ${info.email}\n`;
            if (info.phone) output += `Phone: ${info.phone}\n`;
            if (info.location) output += `Location: ${info.location}\n`;
            if (info.title) output += `Title: ${info.title}\n`;
        }

        if (include_social) {
          output += `\nProfessional Links:\n`;
          if (info.linkedin_url) output += `• LinkedIn: ${info.linkedin_url}\n`;
          if (info.github_url) output += `• GitHub: ${info.github_url}\n`;
          if (info.twitter_url) output += `• Twitter: ${info.twitter_url}\n`;
          if (info.website) output += `• Website: ${info.website}\n`;
        }

        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      } catch (error) {
        console.error('Error getting contact info:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error getting contact information: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  },

  ai_chat_conversation: {
    name: 'ai_chat_conversation',
    description: 'Have a conversation with Lewis Perez\'s AI portfolio system. Enables structured interviews, assessments, and interactive exploration.',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: 'Optional session ID to continue existing conversation' },
        conversation_type: { 
          type: 'string', 
          enum: ['interview', 'assessment', 'exploration', 'analysis'], 
          description: 'Type of conversation to conduct' 
        },
        message: { type: 'string', description: 'Message to send to the AI', minLength: 1, maxLength: 2000 },
        context: { type: 'string', description: 'Additional context for the conversation' },
        persona: { 
          type: 'string', 
          enum: ['interviewer', 'technical_assessor', 'curious_explorer', 'analyst'], 
          description: 'Conversation persona to adopt' 
        },
        ai_model: { type: 'string', description: 'Specify AI model to use (e.g., "openai/gpt-4o")' },
        include_sources: { type: 'boolean', default: true, description: 'Include source citations in response' },
        start_new_session: { type: 'boolean', default: false, description: 'Force start a new conversation session' },
        max_conversation_length: { type: 'number', minimum: 2, maximum: 100, description: 'Maximum conversation turns' },
        response_format: { 
          type: 'string', 
          enum: ['detailed', 'concise', 'technical', 'conversational'], 
          default: 'detailed', 
          description: 'Response formatting style' 
        }
      },
      required: ['conversation_type', 'message'],
    },
    handler: async ({ 
      session_id, 
      conversation_type, 
      message, 
      context, 
      persona, 
      ai_model, 
      include_sources = true, 
      start_new_session = false, 
      max_conversation_length, 
      response_format = 'detailed' 
    }: AIChatQuery) => {
      const startTime = Date.now();
      
      try {
        // Generate or use session ID
        const sessionId = start_new_session 
          ? `ai_chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
          : (session_id || `ai_chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

        // Create session if it doesn't exist
        await createOrUpdateSession(sessionId, conversation_type, persona, ai_model);

        // Retrieve conversation history
        const conversationHistory = await getAIChatHistory(sessionId);

        // Enhance message with persona context
        const enhancedMessage = enhanceMessageWithPersona(message, persona, conversation_type, context);

        // Generate AI response using existing chat system
        const aiResponse = await generateAIResponse(
          enhancedMessage,
          conversationHistory,
          sessionId,
          {
            model: ai_model,
            includeSources: include_sources,
            responseFormat: response_format,
            maxLength: max_conversation_length
          }
        );

        // Update conversation history
        const updatedHistory = await updateConversationHistory(sessionId, enhancedMessage, aiResponse.response);

        // Generate follow-up suggestions
        const followUpQuestions = await generateFollowUpQuestions(aiResponse.response, conversation_type, persona);

        // Calculate session metrics
        const responseTime = Date.now() - startTime;
        await logAIConversationAnalytics(sessionId, {
          conversation_turn: updatedHistory.length,
          question_type: conversation_type,
          response_quality_score: 0.9, // Placeholder - could be calculated
          technical_depth_score: 0.8,  // Placeholder - could be calculated
          topics_mentioned: extractTopics(aiResponse.response),
          technologies_discussed: extractTechnologies(aiResponse.response),
          sources_utilized: aiResponse.sources?.length || 0,
          response_time_ms: responseTime
        });

        // Format response
        return {
          content: [
            {
              type: 'text',
              text: formatAIConversationResponse(aiResponse, {
                sessionId,
                conversationType: conversation_type,
                persona,
                responseFormat: response_format,
                followUpQuestions,
                conversationTurn: updatedHistory.length
              })
            }
          ],
          metadata: {
            session_id: sessionId,
            conversation_type,
            persona,
            response_time_ms: responseTime,
            model_used: ai_model || 'default',
            conversation_turn: updatedHistory.length,
            sources_consulted: aiResponse.sources?.length || 0,
            session_status: {
              is_active: true,
              can_continue: updatedHistory.length < (max_conversation_length || 20),
              suggested_next_questions: followUpQuestions
            }
          }
        };
      } catch (error) {
        console.error('Error in AI chat conversation:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error in AI conversation: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or start a new session.`,
            },
          ],
        };
      }
    }
  }
};

// Get tools list for MCP discovery
export function getToolsList() {
  return {
    tools: Object.values(mcpTools).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }))
  };
}

// Execute a tool by name
export async function executeTool(name: string, args: any) {
  const tool = mcpTools[name as keyof typeof mcpTools];
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  
  return await tool.handler(args);
}

// Initialize the server (simple version)
export async function initializeMCPServer() {
  try {
    console.log('MCP Server initialized successfully');
    console.log(`Available tools: ${Object.keys(mcpTools).join(', ')}`);
    return mcpTools;
  } catch (error) {
    console.error('Failed to initialize MCP Server:', error);
    throw error;
  }
}