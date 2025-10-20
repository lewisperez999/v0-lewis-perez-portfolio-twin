"use server"

import { query, transaction } from "@/lib/database"
import { ensureTable } from "@/lib/table-init"
import { revalidatePath } from "next/cache"

// Database row interface for projects table
interface ProjectRow {
  id: number | string
  professional_id: number | null
  name: string
  description: string
  technologies: string[]
  role: string | null
  outcomes: string[]
  challenges: string[]
  demo_url: string | null
  repository_url: string | null
  documentation_url: string | null
  created_at: string | Date
}

export interface Project {
  id: string
  professional_id: number | null
  name: string
  description: string
  technologies: string[]
  role: string | null
  outcomes: string[]
  challenges: string[]
  demo_url: string | null
  repository_url: string | null
  documentation_url: string | null
  created_at: Date
}

// Ensure projects table exists (already defined in schema, but ensure it's there)
async function ensureProjectsTable(): Promise<void> {
  return ensureTable('projects', `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      professional_id INTEGER,
      name VARCHAR(255),
      description TEXT,
      technologies TEXT[],
      role VARCHAR(255),
      outcomes TEXT[],
      challenges TEXT[],
      demo_url VARCHAR(500),
      repository_url VARCHAR(500),
      documentation_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
  try {
    await ensureProjectsTable()

    const rows = await query<ProjectRow>(`
      SELECT 
        id, professional_id, name, description, technologies, role, outcomes, challenges,
        demo_url, repository_url, documentation_url, created_at
      FROM projects 
      ORDER BY created_at DESC
    `)

    return rows.map(row => ({
      id: String(row.id),
      professional_id: row.professional_id,
      name: row.name,
      description: row.description,
      technologies: Array.isArray(row.technologies) ? row.technologies : [],
      role: row.role,
      outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
      challenges: Array.isArray(row.challenges) ? row.challenges : [],
      demo_url: row.demo_url,
      repository_url: row.repository_url,
      documentation_url: row.documentation_url,
      created_at: new Date(row.created_at)
    }))

  } catch (error) {
    console.error("Error getting projects:", error)
    throw new Error("Failed to get projects")
  }
}

// Get featured projects (we'll use all projects since there's no featured column)
export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    // Since there's no featured column, return all projects
    return await getProjects()
  } catch (error) {
    console.error("Error getting featured projects:", error)
    throw new Error("Failed to get featured projects")
  }
}

// Get single project by ID
export async function getProject(id: string): Promise<Project | null> {
  try {
    await ensureProjectsTable()

    const rows = await query<ProjectRow>(`
      SELECT 
        id, professional_id, name, description, technologies, role, outcomes, challenges,
        demo_url, repository_url, documentation_url, created_at
      FROM projects 
      WHERE id = $1
    `, [id])

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      id: String(row.id),
      professional_id: row.professional_id,
      name: row.name,
      description: row.description,
      technologies: Array.isArray(row.technologies) ? row.technologies : [],
      role: row.role,
      outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
      challenges: Array.isArray(row.challenges) ? row.challenges : [],
      demo_url: row.demo_url,
      repository_url: row.repository_url,
      documentation_url: row.documentation_url,
      created_at: new Date(row.created_at)
    }

  } catch (error) {
    console.error("Error getting project:", error)
    throw new Error("Failed to get project")
  }
}

// Create a new project
export async function createProject(data: Omit<Project, "id" | "created_at">): Promise<Project> {
  try {
    await ensureProjectsTable()

    const rows = await query<ProjectRow>(`
      INSERT INTO projects (professional_id, name, description, technologies, role, outcomes, challenges, demo_url, repository_url, documentation_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.professional_id, data.name, data.description, data.technologies,
      data.role, data.outcomes, data.challenges, data.demo_url, data.repository_url, data.documentation_url
    ])

    const project: Project = {
      id: String(rows[0].id),
      professional_id: rows[0].professional_id,
      name: rows[0].name,
      description: rows[0].description,
      technologies: Array.isArray(rows[0].technologies) ? rows[0].technologies : [],
      role: rows[0].role,
      outcomes: Array.isArray(rows[0].outcomes) ? rows[0].outcomes : [],
      challenges: Array.isArray(rows[0].challenges) ? rows[0].challenges : [],
      demo_url: rows[0].demo_url,
      repository_url: rows[0].repository_url,
      documentation_url: rows[0].documentation_url,
      created_at: new Date(rows[0].created_at)
    }

    revalidatePath("/admin/projects")
    revalidatePath("/")

    console.log("Project created successfully:", data.name)
    return project

  } catch (error) {
    console.error("Error creating project:", error)
    throw new Error("Failed to create project")
  }
}

// Update an existing project
export async function updateProject(id: string, data: Omit<Project, "id" | "created_at">): Promise<Project> {
  try {
    await ensureProjectsTable()

    const rows = await query<ProjectRow>(`
      UPDATE projects 
      SET professional_id = $1, name = $2, description = $3, technologies = $4,
          role = $5, outcomes = $6, challenges = $7, demo_url = $8, 
          repository_url = $9, documentation_url = $10
      WHERE id = $11
      RETURNING *
    `, [
      data.professional_id, data.name, data.description, data.technologies,
      data.role, data.outcomes, data.challenges, data.demo_url, 
      data.repository_url, data.documentation_url, id
    ])

    if (rows.length === 0) {
      throw new Error("Project not found")
    }

    const project: Project = {
      id: String(rows[0].id),
      professional_id: rows[0].professional_id,
      name: rows[0].name,
      description: rows[0].description,
      technologies: Array.isArray(rows[0].technologies) ? rows[0].technologies : [],
      role: rows[0].role,
      outcomes: Array.isArray(rows[0].outcomes) ? rows[0].outcomes : [],
      challenges: Array.isArray(rows[0].challenges) ? rows[0].challenges : [],
      demo_url: rows[0].demo_url,
      repository_url: rows[0].repository_url,
      documentation_url: rows[0].documentation_url,
      created_at: new Date(rows[0].created_at)
    }

    revalidatePath("/admin/projects")
    revalidatePath("/")

    console.log("Project updated successfully:", data.name)
    return project

  } catch (error) {
    console.error("Error updating project:", error)
    throw new Error("Failed to update project")
  }
}

// Delete project
export async function deleteProject(id: string): Promise<void> {
  try {
    await ensureProjectsTable()

    const result = await query<{ id: string | number }>(`
      DELETE FROM projects 
      WHERE id = $1
      RETURNING id
    `, [id])

    if (result.length === 0) {
      throw new Error("Project not found")
    }

    revalidatePath("/admin/projects")
    revalidatePath("/")

    console.log("Project deleted successfully:", id)

  } catch (error) {
    console.error("Error deleting project:", error)
    throw new Error("Failed to delete project")
  }
}

// Initialize with default project data if table is empty
export async function initializeDefaultProjects(): Promise<void> {
  try {
    await ensureProjectsTable()

    // Check if any projects exist
    const rows = await query<{ count: string | number }>(`SELECT COUNT(*) as count FROM projects`)
    
    if (parseInt(String(rows[0].count)) > 0) {
      return // Already has data
    }

    // Create default projects using the correct schema
    const defaultProjects = [
      {
        professional_id: 1,
        name: "E-Commerce Platform",
        description: "A full-stack e-commerce platform with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, and inventory management.",
        technologies: ["React", "Node.js", "Express", "PostgreSQL", "Stripe", "Docker", "AWS"],
        role: "Full Stack Developer",
        outcomes: ["Successfully launched platform", "Increased sales by 150%", "Improved user experience"],
        challenges: ["Payment integration complexity", "Scalability requirements", "Security implementation"],
        demo_url: "https://ecommerce-demo.lewisperez.dev",
        repository_url: "https://github.com/lewisperez/ecommerce-platform",
        documentation_url: null
      },
      {
        professional_id: 1,
        name: "AI Task Manager",
        description: "An intelligent task management application powered by AI for smart prioritization and deadline prediction.",
        technologies: ["Next.js", "TypeScript", "OpenAI API", "Prisma", "TailwindCSS", "Vercel"],
        role: "Frontend Developer",
        outcomes: ["Improved productivity by 40%", "Reduced manual planning time", "Enhanced team collaboration"],
        challenges: ["AI model integration", "Real-time updates", "Performance optimization"],
        demo_url: "https://ai-tasks.lewisperez.dev",
        repository_url: "https://github.com/lewisperez/ai-task-manager",
        documentation_url: null
      },
      {
        professional_id: 1,
        name: "Real-time Chat Application",
        description: "A scalable real-time chat application with WebSocket support, file sharing, and message encryption.",
        technologies: ["Socket.io", "React", "Node.js", "Redis", "MongoDB", "JWT"],
        role: "Backend Developer",
        outcomes: ["Support for 10k+ concurrent users", "99.9% uptime achieved", "End-to-end encryption implemented"],
        challenges: ["WebSocket scaling", "Message synchronization", "Security protocols"],
        demo_url: null,
        repository_url: "https://github.com/lewisperez/realtime-chat",
        documentation_url: null
      }
    ]

    for (const project of defaultProjects) {
      await createProject(project)
    }

    console.log("Default projects initialized")

  } catch (error) {
    console.error("Error initializing default projects:", error)
    // Don't throw error to prevent breaking the app
  }
}