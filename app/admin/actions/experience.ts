"use server"

import { query, transaction } from "@/lib/database"
import { revalidatePath } from "next/cache"

// Database row interface for experiences table
interface ExperienceRow {
  id: number | string
  company: string
  position: string
  start_date: string | Date
  end_date: string | Date | null
  duration: string | null
  description: string
  achievements: string[]
  technologies: string[]
  created_at: string | Date
}

export interface Experience {
  id: string
  company: string
  position: string
  start_date: string
  end_date: string | null
  duration: string | null
  description: string
  achievements: string[]
  technologies: string[]
  created_at: Date
}

// Ensure experiences table exists (already defined in schema, but ensure it's there)
async function ensureExperiencesTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY,
        company VARCHAR(255),
        position VARCHAR(255),
        start_date DATE,
        end_date DATE,
        duration VARCHAR(100),
        description TEXT,
        achievements TEXT[],
        technologies TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    console.log("Experiences table ensured")
  } catch (error) {
    console.error("Error ensuring experiences table:", error)
    throw error
  }
}

// Get all experiences
export async function getExperiences(): Promise<Experience[]> {
  try {
    await ensureExperiencesTable()

    const rows = await query<ExperienceRow>(`
      SELECT 
        id, company, position, start_date, end_date, duration, description,
        achievements, technologies, created_at
      FROM experiences 
      ORDER BY start_date DESC
    `)

    return rows.map(row => ({
      id: String(row.id),
      company: row.company,
      position: row.position,
      start_date: typeof row.start_date === 'string' ? row.start_date : (row.start_date ? row.start_date.toISOString().split('T')[0] : ''),
      end_date: row.end_date ? (typeof row.end_date === 'string' ? row.end_date : row.end_date.toISOString().split('T')[0]) : null,
      duration: row.duration,
      description: row.description,
      achievements: Array.isArray(row.achievements) ? row.achievements : [],
      technologies: Array.isArray(row.technologies) ? row.technologies : [],
      created_at: new Date(row.created_at)
    }))

  } catch (error) {
    console.error("Error getting experiences:", error)
    throw new Error("Failed to get experiences")
  }
}

// Get single experience by ID
export async function getExperience(id: string): Promise<Experience | null> {
  try {
    await ensureExperiencesTable()

    const rows = await query<ExperienceRow>(`
      SELECT 
        id, company, position, start_date, end_date, duration, description,
        achievements, technologies, created_at
      FROM experiences 
      WHERE id = $1
    `, [id])

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      id: String(row.id),
      company: row.company,
      position: row.position,
      start_date: typeof row.start_date === 'string' ? row.start_date : (row.start_date ? row.start_date.toISOString().split('T')[0] : ''),
      end_date: row.end_date ? (typeof row.end_date === 'string' ? row.end_date : row.end_date.toISOString().split('T')[0]) : null,
      duration: row.duration,
      description: row.description,
      achievements: Array.isArray(row.achievements) ? row.achievements : [],
      technologies: Array.isArray(row.technologies) ? row.technologies : [],
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
      (company, position, start_date, end_date, duration, description, achievements, technologies)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.company, data.position, data.start_date, data.end_date, data.duration,
      data.description, data.achievements, data.technologies
    ])

    const newExperience: Experience = {
      id: String(rows[0].id),
      company: rows[0].company,
      position: rows[0].position,
      start_date: typeof rows[0].start_date === 'string' ? rows[0].start_date : (rows[0].start_date ? rows[0].start_date.toISOString().split('T')[0] : ''),
      end_date: rows[0].end_date ? (typeof rows[0].end_date === 'string' ? rows[0].end_date : rows[0].end_date.toISOString().split('T')[0]) : null,
      duration: rows[0].duration,
      description: rows[0].description,
      achievements: Array.isArray(rows[0].achievements) ? rows[0].achievements : [],
      technologies: Array.isArray(rows[0].technologies) ? rows[0].technologies : [],
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
        company = $1, position = $2, start_date = $3, end_date = $4, duration = $5,
        description = $6, achievements = $7, technologies = $8
      WHERE id = $9
      RETURNING *
    `, [
      data.company, data.position, data.start_date, data.end_date, data.duration,
      data.description, data.achievements, data.technologies, id
    ])

    if (rows.length === 0) {
      throw new Error("Experience not found")
    }

    const updatedExperience: Experience = {
      id: String(rows[0].id),
      company: rows[0].company,
      position: rows[0].position,
      start_date: typeof rows[0].start_date === 'string' ? rows[0].start_date : (rows[0].start_date ? rows[0].start_date.toISOString().split('T')[0] : ''),
      end_date: rows[0].end_date ? (typeof rows[0].end_date === 'string' ? rows[0].end_date : rows[0].end_date.toISOString().split('T')[0]) : null,
      duration: rows[0].duration,
      description: rows[0].description,
      achievements: Array.isArray(rows[0].achievements) ? rows[0].achievements : [],
      technologies: Array.isArray(rows[0].technologies) ? rows[0].technologies : [],
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
        technologies: ["Java", "Spring Boot", "PostgreSQL", "Redis", "AWS", "Docker"]
      },
      {
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
        technologies: ["Java", "Oracle", "Spring Framework", "REST APIs", "Linux"]
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