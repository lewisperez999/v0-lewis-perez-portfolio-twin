"use server"

import { query, transaction } from "@/lib/database"
import { ensureTable } from "@/lib/table-init"
import { revalidatePath } from "next/cache"

// Database row interface for experiences table
interface ExperienceRow {
  id: number | string
  professional_id: number
  company: string
  position: string
  start_date: string | Date | null
  end_date: string | Date | null
  duration: string | null
  description: string
  achievements: string[]
  technologies: string[]
  skills_developed: string[]
  impact: string
  keywords: string[]
  created_at: string | Date
}

export interface Experience {
  id: string
  professional_id: number
  company: string
  position: string
  start_date: string | null
  end_date: string | null
  duration: string | null
  description: string
  achievements: string[]
  technologies: string[]
  skills_developed: string[]
  impact: string
  keywords: string[]
  created_at: Date
}

// Ensure experiences table exists (already defined in schema, but ensure it's there)
async function ensureExperiencesTable(): Promise<void> {
  return ensureTable('experiences', `
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY,
      professional_id INTEGER,
      company VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      duration VARCHAR(100),
      start_date DATE,
      end_date DATE,
      description TEXT,
      achievements TEXT[],
      technologies TEXT[],
      skills_developed TEXT[],
      impact TEXT,
      keywords TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
}

// Get all experiences with caching
export async function getExperiences(): Promise<Experience[]> {
  // Use unstable_cache for Next.js data cache integration
  const { unstable_cache } = await import('next/cache');
  
  const getCachedExperiences = unstable_cache(
    async () => {
      try {
        await ensureExperiencesTable()

        const rows = await query<ExperienceRow>(`
          SELECT 
            id, professional_id, company, position, start_date, end_date, duration, description,
            achievements, technologies, skills_developed, impact, keywords, created_at
          FROM experiences 
          ORDER BY start_date DESC
        `)

        return rows.map(row => ({
          id: String(row.id),
          professional_id: row.professional_id || 1,
          company: row.company,
          position: row.position,
          start_date: row.start_date ? (typeof row.start_date === 'string' ? row.start_date : row.start_date.toISOString().split('T')[0]) : null,
          end_date: row.end_date ? (typeof row.end_date === 'string' ? row.end_date : row.end_date.toISOString().split('T')[0]) : null,
          duration: row.duration,
          description: row.description,
          achievements: Array.isArray(row.achievements) ? row.achievements : [],
          technologies: Array.isArray(row.technologies) ? row.technologies : [],
          skills_developed: Array.isArray(row.skills_developed) ? row.skills_developed : [],
          impact: row.impact || '',
          keywords: Array.isArray(row.keywords) ? row.keywords : [],
          created_at: new Date(row.created_at)
        }))

      } catch (error) {
        console.error("Error getting experiences:", error)
        throw new Error("Failed to get experiences")
      }
    },
    ['experiences'],
    { revalidate: 3600, tags: ['experiences'] }
  );
  
  return getCachedExperiences();
}

// Get single experience by ID
export async function getExperience(id: string): Promise<Experience | null> {
  try {
    await ensureExperiencesTable()

    const rows = await query<ExperienceRow>(`
      SELECT 
        id, professional_id, company, position, start_date, end_date, duration, description,
        achievements, technologies, skills_developed, impact, keywords, created_at
      FROM experiences 
      WHERE id = $1
    `, [id])

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      id: String(row.id),
      professional_id: row.professional_id || 1,
      company: row.company,
      position: row.position,
      start_date: row.start_date ? (typeof row.start_date === 'string' ? row.start_date : row.start_date.toISOString().split('T')[0]) : null,
      end_date: row.end_date ? (typeof row.end_date === 'string' ? row.end_date : row.end_date.toISOString().split('T')[0]) : null,
      duration: row.duration,
      description: row.description,
      achievements: Array.isArray(row.achievements) ? row.achievements : [],
      technologies: Array.isArray(row.technologies) ? row.technologies : [],
      skills_developed: Array.isArray(row.skills_developed) ? row.skills_developed : [],
      impact: row.impact || '',
      keywords: Array.isArray(row.keywords) ? row.keywords : [],
      created_at: new Date(row.created_at)
    }

  } catch (error) {
    console.error("Error getting experience:", error)
    throw new Error("Failed to get experience")
  }
}

// Create new experience
export async function createExperience(data: Omit<Experience, 'id' | 'created_at'>): Promise<Experience> {
  try {
    await ensureExperiencesTable()

    const rows = await query<ExperienceRow>(`
      INSERT INTO experiences 
      (professional_id, company, position, start_date, end_date, duration, description, achievements, technologies, skills_developed, impact, keywords)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      data.professional_id || 1, data.company, data.position, data.start_date, data.end_date, data.duration,
      data.description, data.achievements, data.technologies, data.skills_developed || [], data.impact || '', data.keywords || []
    ])

    const newExperience: Experience = {
      id: String(rows[0].id),
      professional_id: rows[0].professional_id,
      company: rows[0].company,
      position: rows[0].position,
      start_date: rows[0].start_date ? (typeof rows[0].start_date === 'string' ? rows[0].start_date : rows[0].start_date.toISOString().split('T')[0]) : null,
      end_date: rows[0].end_date ? (typeof rows[0].end_date === 'string' ? rows[0].end_date : rows[0].end_date.toISOString().split('T')[0]) : null,
      duration: rows[0].duration,
      description: rows[0].description,
      achievements: Array.isArray(rows[0].achievements) ? rows[0].achievements : [],
      technologies: Array.isArray(rows[0].technologies) ? rows[0].technologies : [],
      skills_developed: Array.isArray(rows[0].skills_developed) ? rows[0].skills_developed : [],
      impact: rows[0].impact || '',
      keywords: Array.isArray(rows[0].keywords) ? rows[0].keywords : [],
      created_at: new Date(rows[0].created_at)
    }

    revalidatePath('/admin/experience')
    revalidatePath('/')

    console.log("Experience created successfully:", data.company)
    return newExperience

  } catch (error) {
    console.error("Error creating experience:", error)
    throw new Error("Failed to create experience")
  }
}

// Update experience
export async function updateExperience(id: string, data: Omit<Experience, 'id' | 'created_at'>): Promise<Experience> {
  try {
    await ensureExperiencesTable()

    const rows = await query<ExperienceRow>(`
      UPDATE experiences 
      SET 
        professional_id = $1, company = $2, position = $3, start_date = $4, end_date = $5, duration = $6,
        description = $7, achievements = $8, technologies = $9, skills_developed = $10, impact = $11, keywords = $12
      WHERE id = $13
      RETURNING *
    `, [
      data.professional_id || 1, data.company, data.position, data.start_date, data.end_date, data.duration,
      data.description, data.achievements, data.technologies, data.skills_developed || [], data.impact || '', data.keywords || [], id
    ])

    if (rows.length === 0) {
      throw new Error("Experience not found")
    }

    const updatedExperience: Experience = {
      id: String(rows[0].id),
      professional_id: rows[0].professional_id,
      company: rows[0].company,
      position: rows[0].position,
      start_date: rows[0].start_date ? (typeof rows[0].start_date === 'string' ? rows[0].start_date : rows[0].start_date.toISOString().split('T')[0]) : null,
      end_date: rows[0].end_date ? (typeof rows[0].end_date === 'string' ? rows[0].end_date : rows[0].end_date.toISOString().split('T')[0]) : null,
      duration: rows[0].duration,
      description: rows[0].description,
      achievements: Array.isArray(rows[0].achievements) ? rows[0].achievements : [],
      technologies: Array.isArray(rows[0].technologies) ? rows[0].technologies : [],
      skills_developed: Array.isArray(rows[0].skills_developed) ? rows[0].skills_developed : [],
      impact: rows[0].impact || '',
      keywords: Array.isArray(rows[0].keywords) ? rows[0].keywords : [],
      created_at: new Date(rows[0].created_at)
    }

    revalidatePath('/admin/experience')
    revalidatePath('/')

    console.log("Experience updated successfully:", data.company)
    return updatedExperience

  } catch (error) {
    console.error("Error updating experience:", error)
    throw new Error("Failed to update experience")
  }
}

// Delete experience
export async function deleteExperience(id: string): Promise<void> {
  try {
    await ensureExperiencesTable()

    const result = await query<{ id: string | number }>(`
      DELETE FROM experiences 
      WHERE id = $1
      RETURNING id
    `, [id])

    if (result.length === 0) {
      throw new Error("Experience not found")
    }

    revalidatePath('/admin/experience')
    revalidatePath('/')

    console.log("Experience deleted successfully:", id)

  } catch (error) {
    console.error("Error deleting experience:", error)
    throw new Error("Failed to delete experience")
  }
}

// Initialize with default experience data if table is empty
export async function initializeDefaultExperiences(): Promise<void> {
  try {
    await ensureExperiencesTable()

    // Check if any experiences exist
    const rows = await query<{ count: string | number }>(`SELECT COUNT(*) as count FROM experiences`)
    
    if (parseInt(String(rows[0].count)) > 0) {
      return // Already has data
    }

    // Create default experiences using the correct schema
    const defaultExperiences = [
      {
        professional_id: 1,
        company: "ING Bank",
        position: "Senior Software Engineer",
        start_date: "2023-01-01",
        end_date: "2024-08-31",
        duration: "1 year 8 months",
        description: "Led development of enterprise banking solutions using Java and Spring Boot. Implemented microservices architecture and optimized API performance.",
        achievements: [
          "Reduced API response times from 500ms to 200ms",
          "Achieved 95% code coverage through automated testing",
          "Led team of 5 developers on critical banking features"
        ],
        technologies: ["Java", "Spring Boot", "PostgreSQL", "Redis", "AWS", "Docker"],
        skills_developed: ["Team Leadership", "Microservices", "Performance Optimization"],
        impact: "Improved system performance by 60% and reduced development time by 30%",
        keywords: ["java", "spring boot", "microservices", "banking", "leadership"]
      },
      {
        professional_id: 1,
        company: "Amdocs",
        position: "Software Engineer",
        start_date: "2020-06-01",
        end_date: "2022-12-31",
        duration: "2 years 7 months",
        description: "Developed telecom billing systems and customer management platforms. Worked on high-volume transaction processing systems.",
        achievements: [
          "Processed millions of billing transactions daily",
          "Improved system reliability to 99.9% uptime",
          "Mentored junior developers"
        ],
        technologies: ["Java", "Oracle", "Spring Framework", "REST APIs", "Linux"],
        skills_developed: ["System Design", "Database Optimization", "Mentoring"],
        impact: "Enabled processing of 10M+ transactions daily with 99.9% reliability",
        keywords: ["java", "oracle", "billing", "telecom", "high-volume"]
      }
    ]

    for (const exp of defaultExperiences) {
      await createExperience(exp)
    }

    console.log("Default experiences initialized")

  } catch (error) {
    console.error("Error initializing default experiences:", error)
    // Don't throw error to prevent breaking the app
  }
}