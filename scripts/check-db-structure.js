const { Pool } = require('pg');

// Use environment variable for database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabaseStructure() {
  try {
    console.log('Checking current database structure...');
    
    const query = 'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position';
    
    // Check projects table
    const projectsInfo = await pool.query(query, ['projects']);
    console.log('\nProjects table columns:');
    projectsInfo.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    
    // Check skills table
    const skillsInfo = await pool.query(query, ['skills']);
    console.log('\nSkills table columns:');
    skillsInfo.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    
    // Check experiences table
    const expInfo = await pool.query(query, ['experiences']);
    console.log('\nExperiences table columns:');
    expInfo.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    
    // Check if personal_info exists
    try {
      const personalInfo = await pool.query(query, ['personal_info']);
      console.log('\nPersonal_info table columns:');
      personalInfo.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    } catch (error) {
      console.log('\nPersonal_info table: Does not exist');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseStructure();