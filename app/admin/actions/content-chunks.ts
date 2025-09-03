"use server"

import { query } from "@/lib/database"
import { revalidatePath } from "next/cache"

// Database query result interfaces
interface ContentChunkRow {
  chunk_id: string
  title: string | null
  content: string
  chunk_type: string | null
  source_file: string | null
  word_count: number | null
  created_at: string | Date
  updated_at: string | Date
}

interface CountRow {
  count: string | number
}

interface StatsRow {
  chunk_type: string
  count: string | number
}

interface TotalStatsRow {
  total_chunks: string | number
  total_words: string | number
  avg_words: string | number
}

interface TableExistsRow {
  exists: boolean
}

export interface ContentChunk {
  chunk_id: string
  title: string | null
  content: string
  chunk_type: string | null
  source_file: string | null
  word_count: number | null
  created_at: Date
  updated_at: Date
}

// Ensure content_chunks table exists
async function ensureContentChunksTable(): Promise<void> {
  try {
    // Check if table exists first
    const tableExists = await query<TableExistsRow>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'content_chunks'
      )
    `)

    if (!tableExists[0]?.exists) {
      console.log("Creating content_chunks table...")
      
      await query(`
        CREATE TABLE content_chunks (
          chunk_id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(500),
          content TEXT NOT NULL,
          chunk_type VARCHAR(100),
          source_file VARCHAR(255),
          word_count INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      // Insert sample data if table was just created
      await query(`
        INSERT INTO content_chunks (chunk_id, title, content, chunk_type, source_file, word_count) 
        VALUES 
          ('exp_ing_001', 'ING Australia Experience', 'Senior Software Engineer at ING Australia with 3+ years developing enterprise banking solutions using Java, Spring Boot, and microservices architecture. Led performance optimization initiatives reducing API response times from 500ms to 200ms.', 'experience', 'experience.md', 45),
          ('skills_java_001', 'Java/Spring Boot Expertise', 'Expert-level Java development with Spring Boot framework. 8+ years of experience building scalable enterprise applications, RESTful APIs, and microservices. Proficient in Spring Security, Spring Data, and Spring Cloud ecosystem.', 'skills', 'skills.md', 38),
          ('projects_ecom_001', 'E-commerce Platform Project', 'Built comprehensive e-commerce platform using Next.js, Shopify integration, and real-time inventory management. Implemented payment processing, order tracking, and admin dashboard with 99.9% uptime.', 'projects', 'projects.md', 32)
        ON CONFLICT (chunk_id) DO NOTHING
      `)

      console.log("Content chunks table created with sample data")
    } else {
      // Table exists, check if we need to add missing columns
      const columns = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'content_chunks'
      `)
      
      const columnNames = columns.map(col => col.column_name)
      
      // Add missing columns if they don't exist
      if (!columnNames.includes('source_file')) {
        console.log("Adding source_file column to content_chunks table")
        await query(`ALTER TABLE content_chunks ADD COLUMN source_file VARCHAR(255)`)
      }
      
      if (!columnNames.includes('word_count')) {
        console.log("Adding word_count column to content_chunks table")
        await query(`ALTER TABLE content_chunks ADD COLUMN word_count INTEGER`)
      }
      
      if (!columnNames.includes('created_at')) {
        console.log("Adding created_at column to content_chunks table")
        await query(`ALTER TABLE content_chunks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`)
      }
      
      if (!columnNames.includes('updated_at')) {
        console.log("Adding updated_at column to content_chunks table")
        await query(`ALTER TABLE content_chunks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`)
      }
    }

    // Create indexes if they don't exist
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_content_chunks_type ON content_chunks(chunk_type);
        CREATE INDEX IF NOT EXISTS idx_content_chunks_created ON content_chunks(created_at);
      `)
    } catch (indexError) {
      console.log("Indexes already exist or cannot be created:", (indexError as Error).message)
    }

    console.log("Content chunks table ensured")
  } catch (error) {
    console.error("Error ensuring content chunks table:", error)
    throw error
  }
}

// Get all content chunks
export async function getContentChunks(): Promise<ContentChunk[]> {
  try {
    await ensureContentChunksTable()

    // First check the actual table structure
    const tableCheck = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_chunks'
      ORDER BY ordinal_position
    `)

    console.log("Content chunks table structure:", tableCheck)

    // Check which columns actually exist
    const columnNames = tableCheck.map(col => col.column_name)
    const hasSourceFile = columnNames.includes('source_file')
    const hasWordCount = columnNames.includes('word_count')

    // Build query based on available columns
    let selectColumns = 'chunk_id, title, content, chunk_type, created_at, updated_at'
    if (hasSourceFile) selectColumns += ', source_file'
    if (hasWordCount) selectColumns += ', word_count'

    const rows = await query<ContentChunkRow>(`
      SELECT ${selectColumns}
      FROM content_chunks 
      ORDER BY created_at DESC
    `)

    console.log(`Found ${rows.length} content chunks`)

    return rows.map(row => ({
      chunk_id: row.chunk_id,
      title: row.title,
      content: row.content,
      chunk_type: row.chunk_type,
      source_file: hasSourceFile ? row.source_file : null,
      word_count: hasWordCount ? (row.word_count || 0) : (String(row.content).split(/\s+/).length),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))

  } catch (error) {
    console.error("Error getting content chunks:", error)
    console.error("Error details:", error instanceof Error ? error.stack : error)
    throw new Error(`Failed to get content chunks: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get content chunks by type
export async function getContentChunksByType(type: string): Promise<ContentChunk[]> {
  try {
    await ensureContentChunksTable()

    const rows = await query<ContentChunkRow>(`
      SELECT 
        chunk_id, title, content, chunk_type, source_file, word_count, created_at, updated_at
      FROM content_chunks 
      WHERE chunk_type = $1
      ORDER BY created_at DESC
    `, [type])

    return rows.map(row => ({
      chunk_id: row.chunk_id,
      title: row.title,
      content: row.content,
      chunk_type: row.chunk_type,
      source_file: row.source_file,
      word_count: row.word_count,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))

  } catch (error) {
    console.error("Error getting content chunks by type:", error)
    throw new Error("Failed to get content chunks by type")
  }
}

// Get single content chunk
export async function getContentChunk(chunkId: string): Promise<ContentChunk | null> {
  try {
    await ensureContentChunksTable()

    const rows = await query<ContentChunkRow>(`
      SELECT 
        chunk_id, title, content, chunk_type, source_file, word_count, created_at, updated_at
      FROM content_chunks 
      WHERE chunk_id = $1
    `, [chunkId])

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      chunk_id: row.chunk_id,
      title: row.title,
      content: row.content,
      chunk_type: row.chunk_type,
      source_file: row.source_file,
      word_count: row.word_count,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }

  } catch (error) {
    console.error("Error getting content chunk:", error)
    throw new Error("Failed to get content chunk")
  }
}

// Create new content chunk
export async function createContentChunk(data: Omit<ContentChunk, 'created_at' | 'updated_at'>): Promise<ContentChunk> {
  try {
    await ensureContentChunksTable()

    // Calculate word count if not provided
    const wordCount = data.word_count || data.content.split(/\s+/).length

    const rows = await query<ContentChunkRow>(`
      INSERT INTO content_chunks 
      (chunk_id, title, content, chunk_type, source_file, word_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING chunk_id, title, content, chunk_type, source_file, word_count, created_at, updated_at
    `, [
      data.chunk_id, data.title, data.content, data.chunk_type, data.source_file, wordCount
    ])

    const newChunk: ContentChunk = {
      chunk_id: rows[0].chunk_id,
      title: rows[0].title,
      content: rows[0].content,
      chunk_type: rows[0].chunk_type,
      source_file: rows[0].source_file,
      word_count: rows[0].word_count,
      created_at: new Date(rows[0].created_at),
      updated_at: new Date(rows[0].updated_at)
    }

    revalidatePath('/admin/content')
    revalidatePath('/')

    console.log("Content chunk created successfully:", data.chunk_id)
    return newChunk

  } catch (error) {
    console.error("Error creating content chunk:", error)
    throw new Error("Failed to create content chunk")
  }
}

// Update content chunk
export async function updateContentChunk(chunkId: string, data: Partial<Omit<ContentChunk, 'chunk_id' | 'created_at' | 'updated_at'>>): Promise<ContentChunk> {
  try {
    await ensureContentChunksTable()

    // Calculate word count if content is being updated
    const wordCount = data.content ? data.content.split(/\s+/).length : undefined

    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    if (data.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`)
      updateValues.push(data.title)
    }
    if (data.content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`)
      updateValues.push(data.content)
    }
    if (data.chunk_type !== undefined) {
      updateFields.push(`chunk_type = $${paramIndex++}`)
      updateValues.push(data.chunk_type)
    }
    if (data.source_file !== undefined) {
      updateFields.push(`source_file = $${paramIndex++}`)
      updateValues.push(data.source_file)
    }
    if (wordCount !== undefined) {
      updateFields.push(`word_count = $${paramIndex++}`)
      updateValues.push(wordCount)
    }

    updateFields.push(`updated_at = NOW()`)
    updateValues.push(chunkId)

    const rows = await query<ContentChunkRow>(`
      UPDATE content_chunks 
      SET ${updateFields.join(', ')}
      WHERE chunk_id = $${paramIndex}
      RETURNING chunk_id, title, content, chunk_type, source_file, word_count, created_at, updated_at
    `, updateValues)

    if (rows.length === 0) {
      throw new Error("Content chunk not found")
    }

    const updatedChunk: ContentChunk = {
      chunk_id: rows[0].chunk_id,
      title: rows[0].title,
      content: rows[0].content,
      chunk_type: rows[0].chunk_type,
      source_file: rows[0].source_file,
      word_count: rows[0].word_count,
      created_at: new Date(rows[0].created_at),
      updated_at: new Date(rows[0].updated_at)
    }

    revalidatePath('/admin/content')
    revalidatePath('/')

    console.log("Content chunk updated successfully:", chunkId)
    return updatedChunk

  } catch (error) {
    console.error("Error updating content chunk:", error)
    throw new Error("Failed to update content chunk")
  }
}

// Delete content chunk
export async function deleteContentChunk(chunkId: string): Promise<void> {
  try {
    await ensureContentChunksTable()

    const result = await query(`
      DELETE FROM content_chunks 
      WHERE chunk_id = $1
      RETURNING chunk_id
    `, [chunkId])

    if (result.length === 0) {
      throw new Error("Content chunk not found")
    }

    revalidatePath('/admin/content')
    revalidatePath('/')

    console.log("Content chunk deleted successfully:", chunkId)

  } catch (error) {
    console.error("Error deleting content chunk:", error)
    throw new Error("Failed to delete content chunk")
  }
}

// Get content chunk statistics
export async function getContentChunkStats(): Promise<{
  totalChunks: number
  chunksByType: Record<string, number>
  totalWords: number
  averageWordsPerChunk: number
}> {
  try {
    await ensureContentChunksTable()

    // Get total chunks and words with safer queries
    const totalResult = await query<TotalStatsRow>(`
      SELECT 
        COUNT(*) as total_chunks,
        COALESCE(SUM(CASE WHEN word_count IS NOT NULL THEN word_count ELSE 0 END), 0) as total_words,
        COALESCE(AVG(CASE WHEN word_count IS NOT NULL THEN word_count ELSE 0 END), 0) as avg_words
      FROM content_chunks
    `)

    const totalData = totalResult[0] || { total_chunks: 0, total_words: 0, avg_words: 0 }

    // Get chunks by type with null handling
    const typeResults = await query<StatsRow>(`
      SELECT 
        COALESCE(chunk_type, 'uncategorized') as chunk_type,
        COUNT(*) as count
      FROM content_chunks
      GROUP BY COALESCE(chunk_type, 'uncategorized')
      ORDER BY count DESC
    `)

    const chunksByType = typeResults.reduce((acc, row) => {
      acc[row.chunk_type] = parseInt(String(row.count)) || 0
      return acc
    }, {} as Record<string, number>)

    const result = {
      totalChunks: parseInt(String(totalData.total_chunks)) || 0,
      chunksByType,
      totalWords: parseInt(String(totalData.total_words)) || 0,
      averageWordsPerChunk: Math.round(parseFloat(String(totalData.avg_words)) || 0)
    }

    console.log("Content chunk stats:", result)
    return result

  } catch (error) {
    console.error("Error getting content chunk stats:", error)
    console.error("Error details:", error instanceof Error ? error.stack : error)
    
    // Return safe defaults instead of throwing
    return {
      totalChunks: 0,
      chunksByType: {},
      totalWords: 0,
      averageWordsPerChunk: 0
    }
  }
}