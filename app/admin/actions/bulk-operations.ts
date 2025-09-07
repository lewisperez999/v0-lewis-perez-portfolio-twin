"use server"

import { transaction } from "@/lib/database"
import { revalidatePath } from "next/cache"
import { updatePersonalInfo, type PersonalInfo } from "./personal-info"
import { createExperience, deleteExperience, type Experience } from "./experience"
import { createProject, deleteProject, type Project } from "./projects"
import { createSkill, deleteSkill, type Skill } from "./skills"
import { createContentChunk, deleteContentChunk, type ContentChunk } from "./content-chunks"

interface BulkPortfolioData {
  personal_info: Omit<PersonalInfo, 'id' | 'created_at' | 'updated_at'>
  experiences: any[] // Use any[] to allow flexible field names from JSON
  projects: any[] // Use any[] to allow flexible field names from JSON  
  skills: any[] // Use any[] to allow flexible field names from JSON
  content_chunks: any[] // Use any[] to allow flexible field names from JSON
}

export interface BulkUpdateResult {
  success: boolean
  message: string
  updated: {
    personalInfo: boolean
    experiences: number
    projects: number
    skills: number
    contentChunks: number
  }
  errors?: string[]
}

/**
 * Bulk update all portfolio data from JSON
 * This will replace all existing data with the provided data
 */
export async function bulkUpdatePortfolioData(data: BulkPortfolioData): Promise<BulkUpdateResult> {
  const errors: string[] = []
  const result: BulkUpdateResult = {
    success: false,
    message: "",
    updated: {
      personalInfo: false,
      experiences: 0,
      projects: 0,
      skills: 0,
      contentChunks: 0
    },
    errors: []
  }

  try {
    await transaction(async () => {
      // 1. Update personal info
      try {
        await updatePersonalInfo(data.personal_info)
        result.updated.personalInfo = true
        console.log("Personal info updated successfully")
      } catch (error) {
        const errorMsg = `Failed to update personal info: ${error instanceof Error ? error.message : String(error)}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }

      // 2. Replace experiences (delete all, then create new ones)
      try {
        // Get existing experiences to delete
        const { getExperiences } = await import("./experience")
        const existingExperiences = await getExperiences()
        
        // Delete existing experiences
        for (const exp of existingExperiences) {
          await deleteExperience(exp.id)
        }

        // Create new experiences with proper field mapping
        for (const expData of data.experiences) {
          // Transform the data to match actual database schema
          const transformedExpData = {
            professional_id: 1, // Default professional ID
            company: expData.company || '',
            position: expData.title || expData.position || '', // Map title to position
            duration: expData.duration || '',
            start_date: expData.start_date || null, // Use null instead of empty string for dates
            end_date: expData.end_date || null, // Can be null
            description: expData.description || '',
            achievements: expData.achievements || [],
            technologies: expData.technologies || [],
            skills_developed: expData.skills_developed || [],
            impact: expData.impact || '',
            keywords: expData.keywords || []
          }
          
          await createExperience(transformedExpData)
          result.updated.experiences++
        }
        console.log(`Updated ${result.updated.experiences} experiences`)
      } catch (error) {
        const errorMsg = `Failed to update experiences: ${error instanceof Error ? error.message : String(error)}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }

      // 3. Replace projects (delete all, then create new ones)
      try {
        // Get existing projects to delete
        const { getProjects } = await import("./projects")
        const existingProjects = await getProjects()
        
        // Delete existing projects
        for (const project of existingProjects) {
          await deleteProject(project.id)
        }

        // Create new projects with proper field mapping
        for (const projectData of data.projects) {
          // Transform the data to match actual database schema
          const transformedProjectData = {
            professional_id: 1, // Default professional ID
            name: projectData.title || projectData.name || '', // Map title to name
            description: projectData.description || '',
            technologies: projectData.technologies || [],
            role: projectData.role || '',
            outcomes: projectData.outcomes || [],
            challenges: projectData.challenges || [],
            demo_url: projectData.live_url || projectData.demo_url || null, // Map live_url to demo_url
            repository_url: projectData.github_url || projectData.repository_url || null, // Map github_url to repository_url
            documentation_url: projectData.documentation_url || null
          }
          
          await createProject(transformedProjectData)
          result.updated.projects++
        }
        console.log(`Updated ${result.updated.projects} projects`)
      } catch (error) {
        const errorMsg = `Failed to update projects: ${error instanceof Error ? error.message : String(error)}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }

      // 4. Replace skills (delete all, then create new ones)
      try {
        // Get existing skills to delete
        const { getSkills } = await import("./skills")
        const existingSkills = await getSkills()
        
        // Delete existing skills
        for (const skill of existingSkills) {
          await deleteSkill(skill.id)
        }

        // Create new skills with proper field mapping
        for (const skillData of data.skills) {
          // Transform the data to match actual database schema
          const transformedSkillData = {
            professional_id: 1, // Default professional ID
            category: skillData.category || 'General',
            skill_name: skillData.name || skillData.skill_name || '', // Map name to skill_name
            proficiency: skillData.proficiency || '',
            experience_years: skillData.years_experience?.toString() || skillData.experience_years || '', // Map years_experience to experience_years
            context: skillData.description || skillData.context || '',
            projects: skillData.projects || [],
            skill_type: skillData.skill_type || 'technical'
          }
          
          await createSkill(transformedSkillData)
          result.updated.skills++
        }
        console.log(`Updated ${result.updated.skills} skills`)
      } catch (error) {
        const errorMsg = `Failed to update skills: ${error instanceof Error ? error.message : String(error)}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }

      // 5. Replace content chunks (delete all, then create new ones)
      try {
        // Get existing content chunks to delete
        const { getContentChunks } = await import("./content-chunks")
        const existingChunks = await getContentChunks()
        
        // Delete existing content chunks
        for (const chunk of existingChunks) {
          await deleteContentChunk(chunk.chunk_id)
        }

        // Create new content chunks with proper field mapping
        for (const chunkData of data.content_chunks) {
          // Transform the data to match actual database schema
          const transformedChunkData = {
            professional_id: 1, // Default professional ID
            chunk_id: chunkData.chunk_id || `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: chunkData.content || '',
            chunk_type: chunkData.content_type || chunkData.chunk_type || 'general', // Map content_type to chunk_type
            title: chunkData.title || '',
            metadata: chunkData.metadata || {},
            importance: chunkData.importance || 'medium',
            date_range: chunkData.date_range || '',
            search_weight: chunkData.priority || chunkData.search_weight || 5, // Map priority to search_weight
            vector_id: chunkData.vector_id || null,
            source_file: chunkData.source_file || '',
            word_count: chunkData.word_count || (chunkData.content ? chunkData.content.split(' ').length : 0)
          }
          
          await createContentChunk(transformedChunkData)
          result.updated.contentChunks++
        }
        console.log(`Updated ${result.updated.contentChunks} content chunks`)
      } catch (error) {
        const errorMsg = `Failed to update content chunks: ${error instanceof Error ? error.message : String(error)}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    })

    // Set result status
    if (errors.length === 0) {
      result.success = true
      result.message = "All portfolio data updated successfully"
    } else {
      result.success = false
      result.message = `Partial update completed with ${errors.length} errors`
      result.errors = errors
    }

    // Revalidate pages
    revalidatePath('/admin/content')
    revalidatePath('/admin')
    revalidatePath('/')

    console.log("Bulk update completed:", result)
    return result

  } catch (error) {
    const errorMsg = `Transaction failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Bulk update transaction failed:", error)
    
    result.success = false
    result.message = errorMsg
    result.errors = [errorMsg, ...errors]
    
    return result
  }
}

/**
 * Validate portfolio data structure before bulk update
 */
export async function validatePortfolioData(data: unknown): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push("Data must be an object")
    return { valid: false, errors }
  }

  const portfolioData = data as Record<string, unknown>

  // Check required top-level fields
  const requiredFields = ['personal_info', 'experiences', 'projects', 'skills', 'content_chunks']
  for (const field of requiredFields) {
    if (!(field in portfolioData)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate personal_info
  if (portfolioData.personal_info && typeof portfolioData.personal_info !== 'object') {
    errors.push("personal_info must be an object")
  }

  // Validate array fields
  const arrayFields: (keyof typeof portfolioData)[] = ['experiences', 'projects', 'skills', 'content_chunks']
  for (const field of arrayFields) {
    if (portfolioData[field] && !Array.isArray(portfolioData[field])) {
      errors.push(`${field} must be an array`)
    }
  }

  // Basic structure validation for personal_info
  if (portfolioData.personal_info && typeof portfolioData.personal_info === 'object') {
    const personalInfo = portfolioData.personal_info as Record<string, unknown>
    const requiredPersonalFields = ['name', 'title', 'email']
    
    for (const field of requiredPersonalFields) {
      if (!personalInfo[field] || typeof personalInfo[field] !== 'string') {
        errors.push(`personal_info.${field} is required and must be a string`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}