import { query } from '@/lib/database';
import { searchVectors } from '@/lib/vector-search';
import { aiChatConversationTool } from './mcp/ai-chat-conversation';
// import { 
//   createOrUpdateSession, 
//   getAIChatHistory, 
//   updateConversationHistory,
//   generateFollowUpQuestions,
//   logAIConversationAnalytics,
//   enhanceMessageWithPersona,
//   formatAIConversationResponse,
//   extractTopics,
//   extractTechnologies
// } from '@/lib/mcp-actions';
// import { generateAIResponse, type Message } from '@/app/actions/chat';

// Define types for our tools
export type SearchQuery = {
  query: string;
  limit?: number;
  category?: 'all' | 'experience' | 'projects' | 'skills' | 'education';
};

export type ProjectQuery = {
  technology?: string;
  type?: 'web' | 'mobile' | 'api' | 'database' | 'ai/ml' | 'other';
  limit?: number;
};

export type SkillQuery = {
  skill_type?: 'technical' | 'soft' | 'language' | 'certification' | 'all';
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all';
  category?: string;
};

export type ExperienceQuery = {
  include_details?: boolean;
  format?: 'chronological' | 'skills_based' | 'summary';
  years?: number;
};

export type ContactQuery = {
  include_social?: boolean;
  format?: 'standard' | 'business' | 'casual';
};

export type AIChatQuery = {
  session_id?: string;
  conversation_type: 'interview' | 'assessment' | 'exploration' | 'analysis';
  message: string;
  persona?: 'interviewer' | 'technical_assessor' | 'curious_explorer' | 'analyst';
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
  }

  // AI Chat Conversation Tool
  , ai_chat_conversation: aiChatConversationTool
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