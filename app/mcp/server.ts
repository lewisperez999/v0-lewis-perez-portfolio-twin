import { z } from 'zod';

// Import existing database utilities
import { query } from '@/lib/database';
import { searchVectors } from '@/lib/vector-search';

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
          : results.filter((r: any) => r.metadata?.category === category);

        const formattedResults = filteredResults.map((result: any) => ({
          content: result.metadata?.content || '',
          relevance: result.score,
          metadata: result.metadata,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Found ${formattedResults.length} relevant professional content items:\n\n${formattedResults.map((item: any, index: number) => 
                `${index + 1}. ${item.content}\n   Relevance: ${(item.relevance * 100).toFixed(1)}%\n   Category: ${item.metadata?.category || 'general'}\n`
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
        type: { 
          type: 'string', 
          enum: ['web', 'mobile', 'api', 'database', 'ai/ml', 'other'], 
          description: 'Project type filter' 
        },
        limit: { type: 'number', default: 10, description: 'Maximum number of projects to return' },
      },
      required: [],
    },
    handler: async ({ technology, type, limit = 10 }: ProjectQuery) => {
      try {
        let queryString = 'SELECT * FROM projects WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (technology) {
          queryString += ` AND (technologies ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
          params.push(`%${technology}%`);
          paramIndex++;
        }

        if (type) {
          queryString += ` AND project_type = $${paramIndex}`;
          params.push(type);
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
          title: project.title,
          description: project.description,
          technologies: project.technologies,
          type: project.project_type,
          url: project.project_url,
          github: project.github_url,
          status: project.status,
          featured: project.featured,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Found ${projects.length} projects:\n\n${projects.map((project: any, index: number) => 
                `${index + 1}. **${project.title}**\n   ${project.description}\n   Technologies: ${project.technologies}\n   Type: ${project.type}\n   Status: ${project.status}\n   ${project.url ? `URL: ${project.url}` : ''}${project.github ? `\n   GitHub: ${project.github}` : ''}\n`
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
        let queryString = 'SELECT id, name, category, description FROM skills WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (skill_type !== 'all') {
          queryString += ` AND category = $${paramIndex}`;
          params.push(skill_type);
          paramIndex++;
        }

        if (category) {
          queryString += ` AND (category ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
          params.push(`%${category}%`);
          paramIndex++;
        }

        queryString += ' ORDER BY name ASC';

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
          name: skill.name,
          category: skill.category,
          description: skill.description,
          certifications: skill.certifications,
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
            output += `  • ${skill.name} (${skill.proficiency})`;
            if (skill.years_experience) {
              output += ` - ${skill.years_experience} years`;
            }
            if (skill.certifications) {
              output += ` - Certified: ${skill.certifications}`;
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
          title: exp.job_title,
          company: exp.company_name,
          location: exp.location,
          startDate: exp.start_date,
          endDate: exp.end_date,
          description: exp.description,
          achievements: exp.achievements,
          technologies: exp.technologies,
          type: exp.employment_type,
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
              output += `   ${duration} | ${exp.location} | ${exp.type}\n`;
              
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
            output += `Name: ${info.full_name}\n`;
            output += `Title: ${info.professional_title}\n`;
            output += `Email: ${info.email}\n`;
            if (info.phone) output += `Phone: ${info.phone}\n`;
            if (info.location) output += `Location: ${info.location}\n`;
            if (info.website_url) output += `Website: ${info.website_url}\n`;
            break;

          case 'casual':
            output = `Hi! I'm ${info.full_name}\n`;
            output += `${info.bio || info.professional_title}\n\n`;
            output += `📧 ${info.email}\n`;
            if (info.phone) output += `📱 ${info.phone}\n`;
            if (info.location) output += `📍 ${info.location}\n`;
            break;

          default: // standard
            output = `Contact Information:\n\n`;
            output += `Name: ${info.full_name}\n`;
            output += `Email: ${info.email}\n`;
            if (info.phone) output += `Phone: ${info.phone}\n`;
            if (info.location) output += `Location: ${info.location}\n`;
            if (info.professional_title) output += `Title: ${info.professional_title}\n`;
        }

        if (include_social) {
          output += `\nProfessional Links:\n`;
          if (info.linkedin_url) output += `• LinkedIn: ${info.linkedin_url}\n`;
          if (info.github_url) output += `• GitHub: ${info.github_url}\n`;
          if (info.twitter_url) output += `• Twitter: ${info.twitter_url}\n`;
          if (info.website_url) output += `• Website: ${info.website_url}\n`;
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