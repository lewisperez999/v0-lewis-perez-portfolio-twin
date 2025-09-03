import { query } from "../lib/database.ts"

async function checkDatabaseRecords() {
  try {
    console.log("🔍 Checking database records...")
    
    // Check what tables exist
    console.log("\n📋 Checking existing tables:")
    const tables = await query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    console.log(`Found ${tables.length} tables:`)
    tables.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`)
    })
    
    // Check if content_chunks table exists
    const contentChunksExists = tables.some(t => t.table_name === 'content_chunks')
    
    if (contentChunksExists) {
      console.log("\n📊 Content chunks table found, getting count:")
      const [chunkCount] = await query(`SELECT COUNT(*) as count FROM content_chunks`)
      console.log(`  Content chunks: ${chunkCount.count}`)
      
      // Get some sample records
      const samples = await query(`
        SELECT chunk_id, title, LENGTH(content) as content_length, chunk_type
        FROM content_chunks 
        ORDER BY created_at DESC 
        LIMIT 5
      `)
      
      console.log("\n📄 Sample content chunks:")
      samples.forEach(sample => {
        console.log(`  - ${sample.chunk_id}: "${sample.title}" (${sample.content_length} chars, type: ${sample.chunk_type})`)
      })
      
    } else {
      console.log("\n⚠️  content_chunks table does not exist")
    }
    
    // Check conversations table
    const conversationsExists = tables.some(t => t.table_name === 'conversations')
    
    if (conversationsExists) {
      console.log("\n💬 Conversations table found, getting count:")
      const [convCount] = await query(`SELECT COUNT(*) as count FROM conversations`)
      console.log(`  Conversations: ${convCount.count}`)
    } else {
      console.log("\n⚠️  conversations table does not exist")
    }
    
    // Calculate total records across all relevant tables
    let totalRecords = 0
    
    for (const table of tables) {
      try {
        const [count] = await query(`SELECT COUNT(*) as count FROM ${table.table_name}`)
        const tableCount = parseInt(count.count) || 0
        totalRecords += tableCount
        console.log(`  ${table.table_name}: ${tableCount} records`)
      } catch (error) {
        console.log(`  ${table.table_name}: Error counting (${error.message})`)
      }
    }
    
    console.log(`\n📈 Total records across all tables: ${totalRecords}`)
    console.log(`\n✅ Database check completed`)
    
  } catch (error) {
    console.error("❌ Database check failed:", error)
  }
}

checkDatabaseRecords()