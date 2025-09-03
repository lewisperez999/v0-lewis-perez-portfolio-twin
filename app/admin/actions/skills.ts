"use server"

import { query, transaction } from "@/lib/database"
import { revalidatePath } from "next/cache"

// Database row interface for skills table
interface SkillRow {
  id: number | string
  professional_id: number | null
  category: string
  skill_name: string
  proficiency: string
  experience_years: string | null
  context: string | null
  projects: string[]
  skill_type: string | null
  created_at: string | Date
}

export interface Skill {
  id: string
  professional_id: number | null
  category: string
  skill_name: string
  proficiency: string
  experience_years: string | null
  context: string | null
  projects: string[]
  skill_type: string | null
  created_at: Date
}

// Ensure skills table exists (already defined in schema, but ensure it's there)
async function ensureSkillsTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY,
        professional_id INTEGER,
        category VARCHAR(100),
        skill_name VARCHAR(255),
        proficiency VARCHAR(50),
        experience_years VARCHAR(50),
        context TEXT,
        projects TEXT[],
        skill_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    console.log("Skills table ensured")
  } catch (error) {
    console.error("Error ensuring skills table:", error)
    throw error
  }
}

// Get all skills
export async function getSkills(): Promise<Skill[]> {
  try {
    await ensureSkillsTable()

    const rows = await query<SkillRow>(`
      SELECT 
        id, professional_id, category, skill_name, proficiency, experience_years, context, projects, skill_type, created_at
      FROM skills 
      ORDER BY category, skill_name
    `)

    return rows.map(row => ({
      id: String(row.id),
      professional_id: row.professional_id,
      category: row.category,
      skill_name: row.skill_name,
      proficiency: row.proficiency,
      experience_years: row.experience_years,
      context: row.context,
      projects: Array.isArray(row.projects) ? row.projects : [],
      skill_type: row.skill_type,
      created_at: new Date(row.created_at)
    }))

  } catch (error) {
    console.error("Error getting skills:", error)
    throw new Error("Failed to get skills")
  }
}

// Get skills by category
export async function getSkillsByCategory(): Promise<Record<string, Skill[]>> {
  try {
    const skills = await getSkills()
    
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, Skill[]>)

  } catch (error) {
    console.error("Error getting skills by category:", error)
    throw new Error("Failed to get skills by category")
  }
}

// Get featured skills (return all since there's no featured column)
export async function getFeaturedSkills(): Promise<Skill[]> {
  try {
    return await getSkills()
  } catch (error) {
    console.error("Error getting featured skills:", error)
    throw new Error("Failed to get featured skills")
  }
}

// Get single skill by ID
export async function getSkill(id: string): Promise<Skill | null> {
  try {
    await ensureSkillsTable()

    const rows = await query<SkillRow>(`
      SELECT 
        id, professional_id, category, skill_name, proficiency, experience_years, context, projects, skill_type, created_at
      FROM skills 
      WHERE id = $1
    `, [id])

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      id: String(row.id),
      professional_id: row.professional_id,
      category: row.category,
      skill_name: row.skill_name,
      proficiency: row.proficiency,
      experience_years: row.experience_years,
      context: row.context,
      projects: Array.isArray(row.projects) ? row.projects : [],
      skill_type: row.skill_type,
      created_at: new Date(row.created_at)
    }

  } catch (error) {
    console.error("Error getting skill:", error)
    throw new Error("Failed to get skill")
  }
}

// Create new skill
export async function createSkill(data: Omit<Skill, 'id' | 'created_at'>): Promise<Skill> {
  try {
    await ensureSkillsTable()

    const rows = await query<SkillRow>(`
      INSERT INTO skills 
      (professional_id, category, skill_name, proficiency, experience_years, context, projects, skill_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.professional_id, data.category, data.skill_name, data.proficiency, 
      data.experience_years, data.context, data.projects, data.skill_type
    ])

    const newSkill: Skill = {
      id: String(rows[0].id),
      professional_id: rows[0].professional_id,
      category: rows[0].category,
      skill_name: rows[0].skill_name,
      proficiency: rows[0].proficiency,
      experience_years: rows[0].experience_years,
      context: rows[0].context,
      projects: Array.isArray(rows[0].projects) ? rows[0].projects : [],
      skill_type: rows[0].skill_type,
      created_at: new Date(rows[0].created_at)
    }

    revalidatePath('/admin/skills')
    revalidatePath('/')

    console.log("Skill created successfully:", data.skill_name)
    return newSkill

  } catch (error) {
    console.error("Error creating skill:", error)
    throw new Error("Failed to create skill")
  }
}

// Update skill
export async function updateSkill(id: string, data: Omit<Skill, 'id' | 'created_at'>): Promise<Skill> {
  try {
    await ensureSkillsTable()

    const rows = await query<SkillRow>(`
      UPDATE skills 
      SET 
        professional_id = $1, category = $2, skill_name = $3, proficiency = $4, 
        experience_years = $5, context = $6, projects = $7, skill_type = $8
      WHERE id = $9
      RETURNING *
    `, [
      data.professional_id, data.category, data.skill_name, data.proficiency,
      data.experience_years, data.context, data.projects, data.skill_type, id
    ])

    if (rows.length === 0) {
      throw new Error("Skill not found")
    }

    const updatedSkill: Skill = {
      id: String(rows[0].id),
      professional_id: rows[0].professional_id,
      category: rows[0].category,
      skill_name: rows[0].skill_name,
      proficiency: rows[0].proficiency,
      experience_years: rows[0].experience_years,
      context: rows[0].context,
      projects: Array.isArray(rows[0].projects) ? rows[0].projects : [],
      skill_type: rows[0].skill_type,
      created_at: new Date(rows[0].created_at)
    }

    revalidatePath('/admin/skills')
    revalidatePath('/')

    console.log("Skill updated successfully:", data.skill_name)
    return updatedSkill

  } catch (error) {
    console.error("Error updating skill:", error)
    throw new Error("Failed to update skill")
  }
}

// Delete skill
export async function deleteSkill(id: string): Promise<void> {
  try {
    await ensureSkillsTable()

    const result = await query<{ id: string | number }>(`
      DELETE FROM skills 
      WHERE id = $1
      RETURNING id
    `, [id])

    if (result.length === 0) {
      throw new Error("Skill not found")
    }

    revalidatePath('/admin/skills')
    revalidatePath('/')

    console.log("Skill deleted successfully:", id)

  } catch (error) {
    console.error("Error deleting skill:", error)
    throw new Error("Failed to delete skill")
  }
}

// Initialize with default skills data if table is empty
export async function initializeDefaultSkills(): Promise<void> {
  try {
    await ensureSkillsTable()

    // Check if any skills exist
    const rows = await query<{ count: string | number }>(`SELECT COUNT(*) as count FROM skills`)
    
    if (parseInt(String(rows[0].count)) > 0) {
      return // Already has data
    }

    // Create default skills using the correct schema
    const defaultSkills = [
      // Programming Languages
      { professional_id: 1, skill_name: "Java", category: "Programming Languages", proficiency: "Expert", experience_years: "8", context: "Enterprise application development with Spring ecosystem", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "TypeScript", category: "Programming Languages", proficiency: "Advanced", experience_years: "5", context: "Type-safe JavaScript for scalable applications", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "JavaScript", category: "Programming Languages", proficiency: "Advanced", experience_years: "6", context: "Full-stack web development and Node.js", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Python", category: "Programming Languages", proficiency: "Intermediate", experience_years: "4", context: "Data analysis, machine learning, and automation", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "SQL", category: "Programming Languages", proficiency: "Expert", experience_years: "7", context: "Database design and complex query optimization", projects: [], skill_type: "Technical" },

      // Frameworks & Libraries
      { professional_id: 1, skill_name: "Spring Boot", category: "Frameworks & Libraries", proficiency: "Expert", experience_years: "6", context: "Microservices and enterprise Java applications", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "React", category: "Frameworks & Libraries", proficiency: "Advanced", experience_years: "4", context: "Modern frontend development with hooks and context", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Next.js", category: "Frameworks & Libraries", proficiency: "Advanced", experience_years: "3", context: "Full-stack React applications with SSR/SSG", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Node.js", category: "Frameworks & Libraries", proficiency: "Intermediate", experience_years: "4", context: "Backend APIs and server-side JavaScript", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Express.js", category: "Frameworks & Libraries", proficiency: "Intermediate", experience_years: "4", context: "RESTful APIs and middleware development", projects: [], skill_type: "Technical" },

      // Databases
      { professional_id: 1, skill_name: "PostgreSQL", category: "Databases", proficiency: "Expert", experience_years: "6", context: "Advanced SQL, stored procedures, and performance tuning", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Oracle Database", category: "Databases", proficiency: "Advanced", experience_years: "5", context: "Enterprise database administration and PL/SQL", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Redis", category: "Databases", proficiency: "Intermediate", experience_years: "3", context: "Caching strategies and session management", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "MongoDB", category: "Databases", proficiency: "Beginner", experience_years: "2", context: "NoSQL document database for flexible schemas", projects: [], skill_type: "Technical" },

      // Cloud & DevOps
      { professional_id: 1, skill_name: "AWS", category: "Cloud & DevOps", proficiency: "Intermediate", experience_years: "4", context: "EC2, S3, RDS, Lambda, and CloudFormation", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Docker", category: "Cloud & DevOps", proficiency: "Advanced", experience_years: "4", context: "Containerization and multi-stage builds", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Kubernetes", category: "Cloud & DevOps", proficiency: "Beginner", experience_years: "2", context: "Container orchestration and deployment", projects: [], skill_type: "Technical" },
      { professional_id: 1, skill_name: "Jenkins", category: "Cloud & DevOps", proficiency: "Intermediate", experience_years: "3", context: "CI/CD pipelines and automated deployments", projects: [], skill_type: "Technical" }
    ]

    for (const skill of defaultSkills) {
      await createSkill(skill)
    }

    console.log("Default skills initialized")

  } catch (error) {
    console.error("Error initializing default skills:", error)
    // Don't throw error to prevent breaking the app
  }
}