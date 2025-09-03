"use server"

import { query, transaction } from "@/lib/database"
import { revalidatePath } from "next/cache"

// Database row interface for personal_info table
interface PersonalInfoRow {
  id: string
  name: string
  title: string
  location: string
  email: string
  phone: string
  summary: string
  bio: string
  tagline: string | null
  highlights: string[]
  website: string | null
  linkedin: string | null
  github: string | null
  twitter: string | null
  created_at: string | Date
  updated_at: string | Date
}

export interface PersonalInfo {
  id: string
  name: string
  title: string
  location: string
  email: string
  phone: string
  summary: string
  bio: string
  tagline: string | null
  highlights: string[]
  website?: string
  linkedin?: string
  github?: string
  twitter?: string
  created_at: Date
  updated_at: Date
}

// Ensure personal_info table exists
async function ensurePersonalInfoTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS personal_info (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        summary TEXT,
        bio TEXT,
        tagline TEXT,
        highlights TEXT[],
        website VARCHAR(500),
        linkedin VARCHAR(500),
        github VARCHAR(500),
        twitter VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create index for faster queries (with error handling)
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_personal_info_created_at ON personal_info(created_at DESC)
      `)
    } catch (indexError) {
      console.log("Index idx_personal_info_created_at already exists or cannot be created:", (indexError as Error).message)
    }

    console.log("Personal info table ensured")
  } catch (error) {
    console.error("Error ensuring personal info table:", error)
    throw error
  }
}

// Get personal info (there should only be one record)
export async function getPersonalInfo(): Promise<PersonalInfo | null> {
  try {
    await ensurePersonalInfoTable()

    const rows = await query<PersonalInfoRow>(`
      SELECT 
        id, name, title, location, email, phone, summary, bio, tagline, highlights,
        website, linkedin, github, twitter, created_at, updated_at
      FROM personal_info 
      ORDER BY created_at DESC 
      LIMIT 1
    `)

    if (rows.length === 0) {
      // Create default personal info if none exists
      return await createDefaultPersonalInfo()
    }

    const row = rows[0]
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      location: row.location,
      email: row.email,
      phone: row.phone,
      summary: row.summary,
      bio: row.bio,
      tagline: row.tagline,
      highlights: Array.isArray(row.highlights) ? row.highlights : [],
      website: row.website || undefined,
      linkedin: row.linkedin || undefined,
      github: row.github || undefined,
      twitter: row.twitter || undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  } catch (error) {
    console.error("Error getting personal info:", error)
    throw new Error("Failed to get personal information")
  }
}

// Create default personal info
async function createDefaultPersonalInfo(): Promise<PersonalInfo> {
  const defaultData = {
    name: "Lewis Perez",
    title: "Senior Software Engineer",
    location: "Melbourne, Australia",
    email: "lewis@lewisperez.dev",
    phone: "+61 XXX XXX XXX",
    summary: "Experienced software engineer with 8+ years in enterprise development, specializing in Java, Spring Boot, and AWS cloud solutions. Currently freelancing and pursuing advanced studies in Melbourne.",
    bio: "Senior Software Engineer with 8+ years' experience building secure, scalable microservices and APIs across banking and telecom, complemented by full‑stack freelancing (React/Next.js/Shopify) in Australia. My strengths lie in Java, Spring Boot, PostgreSQL, and AWS, with proven results including 500ms→200ms latency reductions, +30% throughput gains, and 40% faster data migrations.\n\nI combine enterprise rigor with product speed—optimizing APIs, data flows, and cloud services while coaching teams to deliver. My career journey spans from IBM's global enterprise systems to ING's secure banking microservices, and now includes e-commerce optimization for Australian businesses while pursuing advanced studies in cybersecurity and telecommunications.\n\nFocused on cloud‑native architecture, performance optimization, and mentoring, I'm building toward Solutions Architect or Engineering Lead roles. I thrive in feedback-driven environments where I can deliver measurable business impact while fostering team growth and technical excellence.",
    tagline: "Enterprise-grade reliability with adaptability and measurable impact",
    highlights: [
      "8+ years in banking & telecom with secure, scalable systems",
      "Cross-cultural experience from Philippines to Australia", 
      "Mentored juniors, boosted team velocity +15%",
      "Proven track record of optimization and measurable impact"
    ],
    website: "https://lewisperez.dev",
    linkedin: "https://linkedin.com/in/lewisperez",
    github: "https://github.com/lewisperez999",
    twitter: null
  }

  const [row] = await query<{ id: string; created_at: string | Date; updated_at: string | Date }>(`
    INSERT INTO personal_info 
    (name, title, location, email, phone, summary, bio, tagline, highlights, website, linkedin, github, twitter)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id, created_at, updated_at
  `, [
    defaultData.name, defaultData.title, defaultData.location, defaultData.email,
    defaultData.phone, defaultData.summary, defaultData.bio, defaultData.tagline,
    defaultData.highlights, defaultData.website, defaultData.linkedin, defaultData.github, defaultData.twitter
  ])

  return {
    id: row.id,
    ...defaultData,
    twitter: defaultData.twitter || undefined,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  }
}

// Update personal info
export async function updatePersonalInfo(data: Omit<PersonalInfo, 'id' | 'created_at' | 'updated_at'>): Promise<PersonalInfo> {
  try {
    await ensurePersonalInfoTable()

    // Get existing record
    const existing = await getPersonalInfo()
    
    if (!existing) {
      throw new Error("No personal info found to update")
    }

    const [row] = await query<PersonalInfoRow>(`
      UPDATE personal_info 
      SET 
        name = $1, title = $2, location = $3, email = $4, phone = $5,
        summary = $6, bio = $7, tagline = $8, highlights = $9, website = $10, 
        linkedin = $11, github = $12, twitter = $13, updated_at = NOW()
      WHERE id = $14
      RETURNING id, name, title, location, email, phone, summary, bio, tagline, highlights,
               website, linkedin, github, twitter, created_at, updated_at
    `, [
      data.name, data.title, data.location, data.email, data.phone,
      data.summary, data.bio, data.tagline, data.highlights, data.website, 
      data.linkedin, data.github, data.twitter, existing.id
    ])

    const updatedInfo: PersonalInfo = {
      id: row.id,
      name: row.name,
      title: row.title,
      location: row.location,
      email: row.email,
      phone: row.phone,
      summary: row.summary,
      bio: row.bio,
      tagline: row.tagline,
      highlights: Array.isArray(row.highlights) ? row.highlights : [],
      website: row.website || undefined,
      linkedin: row.linkedin || undefined,
      github: row.github || undefined,
      twitter: row.twitter || undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }

    // Revalidate relevant pages
    revalidatePath('/admin/content')
    revalidatePath('/')

    console.log("Personal info updated successfully")
    return updatedInfo

  } catch (error) {
    console.error("Error updating personal info:", error)
    throw new Error("Failed to update personal information")
  }
}