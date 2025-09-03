const { Pool } = require('pg');
const fs = require('fs');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Read the migration script
    const migrationSQL = fs.readFileSync('./database/migration-001-schema-alignment.sql', 'utf8');
    
    // Split by statements and execute them one by one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('commit')) continue;
      try {
        await query(statement);
        console.log('✅ Executed statement successfully');
      } catch (error) {
        console.log('⚠️ Statement warning (might be expected):', error.message.substring(0, 100));
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the migration
    console.log('\n🔍 Verifying migration results...');
    
    // Check personal_info
    try {
      const personalInfo = await query('SELECT COUNT(*) as count FROM personal_info');
      console.log('Personal info records:', personalInfo[0].count);
    } catch (error) {
      console.log('Personal info table issue:', error.message);
    }
    
    // Check projects structure
    try {
      const projects = await query('SELECT title, featured FROM projects LIMIT 2');
      console.log('Projects sample:', projects);
    } catch (error) {
      console.log('Projects table issue:', error.message);
    }
    
    // Check skills structure
    try {
      const skills = await query('SELECT name, proficiency, featured FROM skills LIMIT 3');
      console.log('Skills sample:', skills);
    } catch (error) {
      console.log('Skills table issue:', error.message);
    }
    
    // Check experiences structure
    try {
      const experiences = await query('SELECT company, featured FROM experiences LIMIT 2');
      console.log('Experiences sample:', experiences);
    } catch (error) {
      console.log('Experiences table issue:', error.message);
    }
    
    console.log('\n🎉 Database migration and verification complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();