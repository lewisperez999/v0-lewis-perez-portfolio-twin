import { query } from '@/lib/database';
import type { MCPTool, Experience, MCPToolOutput } from './types';

/**
 * Experience Management MCP Tool
 * 
 * Provides full CRUD operations for the experiences table:
 * - Create new experience entries
 * - Read/search existing experiences
 * - Update experience information
 * - Delete experience records
 */



export interface ExperienceFilters {
  company?: string;
  position?: string;
  technology?: string;
  skill?: string;
  keyword?: string;
  start_year?: number;
  end_year?: number;
  current_role?: boolean; // null end_date
}

// Create Experience Tool
export const createExperienceTool: MCPTool = {
  name: 'create_experience',
  description: 'Create a new professional experience entry',
  inputSchema: {
    type: 'object',
    properties: {
      company: { type: 'string', description: 'Company name' },
      position: { type: 'string', description: 'Job position/title' },
      duration: { type: 'string', description: 'Duration description (e.g., "2 years", "Jan 2020 - Dec 2021")' },
      start_date: { type: 'string', format: 'date', description: 'Start date (YYYY-MM-DD)' },
      end_date: { type: 'string', format: 'date', description: 'End date (YYYY-MM-DD), omit for current role' },
      description: { type: 'string', description: 'Job description and responsibilities' },
      achievements: { 
        type: 'array', 
        items: { type: 'string' }, 
        description: 'Key achievements and accomplishments' 
      },
      technologies: { 
        type: 'array', 
        items: { type: 'string' }, 
        description: 'Technologies and tools used' 
      },
      skills_developed: { 
        type: 'array', 
        items: { type: 'string' }, 
        description: 'Skills developed in this role' 
      },
      impact: { type: 'string', description: 'Business impact and outcomes' },
      keywords: { 
        type: 'array', 
        items: { type: 'string' }, 
        description: 'Searchable keywords for this experience' 
      },
      professional_id: { type: 'number', description: 'Professional ID (defaults to 1)', default: 1 }
    },
    required: ['company', 'position']
  },
  handler: async (input: Experience) => {
    try {
      const {
        professional_id = 1,
        company,
        position,
        duration,
        start_date,
        end_date,
        description,
        achievements,
        technologies,
        skills_developed,
        impact,
        keywords
      } = input;

      const insertQuery = `
        INSERT INTO experiences (
          professional_id, company, position, duration, start_date, end_date,
          description, achievements, technologies, skills_developed, impact, keywords
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        professional_id,
        company,
        position,
        duration || null,
        start_date || null,
        end_date || null,
        description || null,
        achievements || null,
        technologies || null,
        skills_developed || null,
        impact || null,
        keywords || null
      ];

      const result = await query(insertQuery, values);
      const newExperience = result[0];

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully created new experience:\n\n**${newExperience.position}** at **${newExperience.company}**\n` +
                  `Duration: ${newExperience.duration || 'Not specified'}\n` +
                  `ID: ${newExperience.id}\n` +
                  `Created: ${newExperience.created_at ? new Date(newExperience.created_at as string).toLocaleDateString() : 'Unknown'}`
          }
        ]
      };

    } catch (error) {
      console.error('Create experience error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error creating experience: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }
};

// Read/Search Experiences Tool
export const getExperiencesTool: MCPTool = {
  name: 'get_experiences',
  description: 'Retrieve and search professional experiences with filtering options',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'Specific experience ID to retrieve' },
      company: { type: 'string', description: 'Filter by company name (partial match)' },
      position: { type: 'string', description: 'Filter by position title (partial match)' },
      technology: { type: 'string', description: 'Filter by technology used' },
      skill: { type: 'string', description: 'Filter by skill developed' },
      keyword: { type: 'string', description: 'Filter by keyword' },
      start_year: { type: 'number', description: 'Filter by start year' },
      end_year: { type: 'number', description: 'Filter by end year' },
      current_role: { type: 'boolean', description: 'Filter for current roles (no end date)' },
      limit: { type: 'number', description: 'Maximum number of results', default: 10 },
      professional_id: { type: 'number', description: 'Professional ID (defaults to 1)', default: 1 }
    }
  },
  handler: async (input: ExperienceFilters & { id?: number; limit?: number; professional_id?: number }) => {
    try {
      const {
        id,
        company,
        position,
        technology,
        skill,
        keyword,
        start_year,
        end_year,
        current_role,
        limit = 10,
        professional_id = 1
      } = input;

      let whereConditions = ['professional_id = $1'];
      let queryParams: any[] = [professional_id];
      let paramIndex = 2;

      // Build dynamic WHERE clause
      if (id) {
        whereConditions.push(`id = $${paramIndex}`);
        queryParams.push(id);
        paramIndex++;
      }

      if (company) {
        whereConditions.push(`company ILIKE $${paramIndex}`);
        queryParams.push(`%${company}%`);
        paramIndex++;
      }

      if (position) {
        whereConditions.push(`position ILIKE $${paramIndex}`);
        queryParams.push(`%${position}%`);
        paramIndex++;
      }

      if (technology) {
        whereConditions.push(`$${paramIndex} = ANY(technologies)`);
        queryParams.push(technology);
        paramIndex++;
      }

      if (skill) {
        whereConditions.push(`$${paramIndex} = ANY(skills_developed)`);
        queryParams.push(skill);
        paramIndex++;
      }

      if (keyword) {
        whereConditions.push(`$${paramIndex} = ANY(keywords)`);
        queryParams.push(keyword);
        paramIndex++;
      }

      if (start_year) {
        whereConditions.push(`EXTRACT(YEAR FROM start_date) >= $${paramIndex}`);
        queryParams.push(start_year);
        paramIndex++;
      }

      if (end_year) {
        whereConditions.push(`EXTRACT(YEAR FROM COALESCE(end_date, CURRENT_DATE)) <= $${paramIndex}`);
        queryParams.push(end_year);
        paramIndex++;
      }

      if (current_role !== undefined) {
        if (current_role) {
          whereConditions.push('end_date IS NULL');
        } else {
          whereConditions.push('end_date IS NOT NULL');
        }
      }

      const selectQuery = `
        SELECT 
          id, professional_id, company, position, duration, start_date, end_date,
          description, achievements, technologies, skills_developed, impact, keywords,
          created_at
        FROM experiences 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY 
          CASE WHEN end_date IS NULL THEN 0 ELSE 1 END,
          COALESCE(start_date, created_at) DESC
        LIMIT $${paramIndex}
      `;

      queryParams.push(limit);

      const experiences = await query(selectQuery, queryParams);

      if (id && experiences.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ No experience found with ID: ${id}`
            }
          ]
        };
      }

      if (experiences.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: '📝 No experiences found matching the specified criteria.'
            }
          ]
        };
      }

      // Format the response
      let responseText = `📊 **Found ${experiences.length} Experience${experiences.length > 1 ? 's' : ''}:**\n\n`;

      experiences.forEach((exp: any, index: number) => {
        responseText += `**${index + 1}. ${exp.position}** at **${exp.company}**\n`;
        responseText += `   🆔 ID: ${exp.id}\n`;
        responseText += `   📅 Duration: ${exp.duration || 'Not specified'}\n`;
        
        if (exp.start_date || exp.end_date) {
          const startDate = exp.start_date ? new Date(exp.start_date).toLocaleDateString() : 'Unknown';
          const endDate = exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Current';
          responseText += `   📆 Dates: ${startDate} - ${endDate}\n`;
        }

        if (exp.description) {
          responseText += `   📋 Description: ${exp.description.substring(0, 100)}${exp.description.length > 100 ? '...' : ''}\n`;
        }

        if (exp.technologies && exp.technologies.length > 0) {
          responseText += `   🛠️  Technologies: ${exp.technologies.slice(0, 5).join(', ')}${exp.technologies.length > 5 ? '...' : ''}\n`;
        }

        if (exp.achievements && exp.achievements.length > 0) {
          responseText += `   🏆 Achievements: ${exp.achievements.length} listed\n`;
        }

        if (exp.impact) {
          responseText += `   💼 Impact: ${exp.impact.substring(0, 80)}${exp.impact.length > 80 ? '...' : ''}\n`;
        }

        responseText += '\n';
      });

      return {
        content: [
          {
            type: 'text',
            text: responseText
          }
        ]
      };

    } catch (error) {
      console.error('Get experiences error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error retrieving experiences: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }
};

// Update Experience Tool
export const updateExperienceTool: MCPTool = {
  name: 'update_experience',
  description: 'Update an existing professional experience entry',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'Experience ID to update' },
      company: { type: 'string', description: 'Company name' },
      position: { type: 'string', description: 'Job position/title' },
      duration: { type: 'string', description: 'Duration description' },
      start_date: { type: 'string', format: 'date', description: 'Start date (YYYY-MM-DD)' },
      end_date: { type: 'string', format: 'date', description: 'End date (YYYY-MM-DD), omit for current role' },
      description: { type: 'string', description: 'Job description and responsibilities' },
      achievements: { 
        type: 'array', 
        items: { type: 'string' }, 
        description: 'Key achievements and accomplishments' 
      },
      technologies: { 
        type: 'array', 
        items: { type: 'string' }, 
        description: 'Technologies and tools used' 
      },
      skills_developed: { 
        type: 'array', 
        items: { type: 'string' }, 
        description: 'Skills developed in this role' 
      },
      impact: { type: 'string', description: 'Business impact and outcomes' },
      keywords: { 
        type: 'array', 
        items: { type: 'string' }, 
        description: 'Searchable keywords for this experience' 
      }
    },
    required: ['id']
  },
  handler: async (input: Partial<Experience> & { id: number }) => {
    try {
      const { id, ...updates } = input;

      // First, check if the experience exists
      const existingExp = await query('SELECT * FROM experiences WHERE id = $1', [id]);
      if (existingExp.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ No experience found with ID: ${id}`
            }
          ]
        };
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'professional_id' && key !== 'created_at') {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: '⚠️ No fields to update were provided.'
            }
          ]
        };
      }

      const updateQuery = `
        UPDATE experiences 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      updateValues.push(id);

      const result = await query(updateQuery, updateValues);
      const updatedExperience = result[0];

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully updated experience:\n\n**${updatedExperience.position}** at **${updatedExperience.company}**\n` +
                  `Duration: ${updatedExperience.duration || 'Not specified'}\n` +
                  `ID: ${updatedExperience.id}\n` +
                  `Updated: ${updateFields.length} field${updateFields.length > 1 ? 's' : ''}`
          }
        ]
      };

    } catch (error) {
      console.error('Update experience error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error updating experience: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }
};

// Delete Experience Tool
export const deleteExperienceTool: MCPTool = {
  name: 'delete_experience',
  description: 'Delete a professional experience entry',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'Experience ID to delete' },
      confirm: { 
        type: 'boolean', 
        description: 'Confirmation flag - must be true to proceed with deletion',
        default: false
      }
    },
    required: ['id', 'confirm']
  },
  handler: async (input: { id: number; confirm: boolean }) => {
    try {
      const { id, confirm } = input;

      if (!confirm) {
        return {
          content: [
            {
              type: 'text',
              text: '⚠️ Deletion not confirmed. Set "confirm": true to proceed with deletion.'
            }
          ]
        };
      }

      // First, get the experience details before deletion
      const existingExp = await query('SELECT * FROM experiences WHERE id = $1', [id]);
      if (existingExp.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ No experience found with ID: ${id}`
            }
          ]
        };
      }

      const experienceToDelete = existingExp[0];

      // Delete the experience
      await query('DELETE FROM experiences WHERE id = $1', [id]);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully deleted experience:\n\n**${experienceToDelete.position}** at **${experienceToDelete.company}**\n` +
                  `ID: ${experienceToDelete.id}\n` +
                  `⚠️ This action cannot be undone.`
          }
        ]
      };

    } catch (error) {
      console.error('Delete experience error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error deleting experience: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }
};

// Experience Statistics Tool
export const getExperienceStatsTool: MCPTool = {
  name: 'get_experience_stats',
  description: 'Get statistics and analytics about professional experiences',
  inputSchema: {
    type: 'object',
    properties: {
      professional_id: { type: 'number', description: 'Professional ID (defaults to 1)', default: 1 }
    }
  },
  handler: async (input: { professional_id?: number }) => {
    try {
      const { professional_id = 1 } = input;

      // Get comprehensive stats
      const statsQuery = `
        WITH experience_stats AS (
          SELECT 
            COUNT(*) as total_experiences,
            COUNT(*) FILTER (WHERE end_date IS NULL) as current_roles,
            COUNT(*) FILTER (WHERE end_date IS NOT NULL) as past_roles,
            COUNT(DISTINCT company) as unique_companies,
            AVG(EXTRACT(EPOCH FROM (COALESCE(end_date, CURRENT_DATE) - start_date)) / (365.25 * 24 * 3600)) as avg_duration_years
          FROM experiences 
          WHERE professional_id = $1
        ),
        tech_stats AS (
          SELECT 
            COUNT(*) as total_technologies,
            array_agg(DISTINCT tech) as all_technologies
          FROM experiences e, unnest(e.technologies) as tech
          WHERE e.professional_id = $1 AND e.technologies IS NOT NULL
        ),
        skill_stats AS (
          SELECT 
            COUNT(*) as total_skills,
            array_agg(DISTINCT skill) as all_skills
          FROM experiences e, unnest(e.skills_developed) as skill
          WHERE e.professional_id = $1 AND e.skills_developed IS NOT NULL
        )
        SELECT 
          es.*,
          ts.total_technologies,
          ss.total_skills,
          (SELECT company FROM experiences WHERE professional_id = $1 AND end_date IS NULL ORDER BY start_date DESC LIMIT 1) as current_company,
          (SELECT position FROM experiences WHERE professional_id = $1 AND end_date IS NULL ORDER BY start_date DESC LIMIT 1) as current_position
        FROM experience_stats es
        CROSS JOIN tech_stats ts
        CROSS JOIN skill_stats ss
      `;

      const statsResult = await query(statsQuery, [professional_id]);
      const stats = statsResult[0];

      // Get top technologies
      const topTechQuery = `
        SELECT tech, COUNT(*) as usage_count
        FROM experiences e, unnest(e.technologies) as tech
        WHERE e.professional_id = $1 AND e.technologies IS NOT NULL
        GROUP BY tech
        ORDER BY usage_count DESC, tech
        LIMIT 10
      `;
      const topTech = await query(topTechQuery, [professional_id]);

      let responseText = `📊 **Professional Experience Statistics**\n\n`;
      responseText += `🏢 **Overview:**\n`;
      responseText += `   • Total Experiences: ${stats.total_experiences}\n`;
      responseText += `   • Current Roles: ${stats.current_roles}\n`;
      responseText += `   • Past Roles: ${stats.past_roles}\n`;
      responseText += `   • Unique Companies: ${stats.unique_companies}\n`;
      
      if (stats.avg_duration_years && typeof stats.avg_duration_years === 'number') {
        responseText += `   • Average Role Duration: ${Math.round(stats.avg_duration_years * 10) / 10} years\n`;
      }

      if (stats.current_company && stats.current_position) {
        responseText += `\n💼 **Current Role:**\n`;
        responseText += `   • ${stats.current_position} at ${stats.current_company}\n`;
      }

      responseText += `\n🛠️ **Technology & Skills:**\n`;
      responseText += `   • Total Technologies Used: ${stats.total_technologies || 0}\n`;
      responseText += `   • Total Skills Developed: ${stats.total_skills || 0}\n`;

      if (topTech.length > 0) {
        responseText += `\n🏆 **Most Used Technologies:**\n`;
        topTech.slice(0, 5).forEach((tech: any, index: number) => {
          responseText += `   ${index + 1}. ${tech.tech} (${tech.usage_count} role${tech.usage_count > 1 ? 's' : ''})\n`;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: responseText
          }
        ]
      };

    } catch (error) {
      console.error('Get experience stats error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error retrieving experience statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }
};

// Export all tools
export const experienceManagementTools = [
  createExperienceTool,
  getExperiencesTool,
  updateExperienceTool,
  deleteExperienceTool,
  getExperienceStatsTool
];

export default experienceManagementTools;