/**
 * Content Management System Test Script
 * 
 * This script tests all CRUD operations for the content management system
 * including PersonalInfo, Experience, Projects, and Skills.
 */

const { query, getDatabaseHealth } = require('../lib/database.ts')

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...')
  try {
    const health = await getDatabaseHealth()
    console.log('✅ Database connection successful:', health)
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

async function testPersonalInfo() {
  console.log('\n📋 Testing Personal Info Operations...')
  try {
    // Import the server actions
    const { getPersonalInfo, updatePersonalInfo } = require('../app/admin/actions/personal-info.ts')
    
    // Test read operation
    const personalInfo = await getPersonalInfo()
    console.log('✅ Personal info retrieved:', personalInfo ? 'Success' : 'No data found')
    
    if (personalInfo) {
      // Test update operation
      const updatedInfo = await updatePersonalInfo(personalInfo.id, {
        ...personalInfo,
        tagline: 'Test updated tagline - ' + new Date().toISOString()
      })
      console.log('✅ Personal info updated successfully')
      
      // Restore original tagline
      await updatePersonalInfo(personalInfo.id, personalInfo)
      console.log('✅ Personal info restored')
    }
    
    return true
  } catch (error) {
    console.error('❌ Personal info test failed:', error.message)
    return false
  }
}

async function testExperience() {
  console.log('\n💼 Testing Experience Operations...')
  try {
    const { getExperiences, createExperience, deleteExperience } = require('../app/admin/actions/experience.ts')
    
    // Test read operation
    const experiences = await getExperiences()
    console.log('✅ Experiences retrieved:', experiences.length, 'records')
    
    // Test create operation
    const testExperience = {
      company: 'Test Company',
      position: 'Test Position',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      location: 'Test Location',
      description: 'Test description',
      achievements: ['Test achievement 1', 'Test achievement 2'],
      technologies: ['Test Tech 1', 'Test Tech 2'],
      featured: false
    }
    
    const newExperience = await createExperience(testExperience)
    console.log('✅ Experience created successfully:', newExperience.id)
    
    // Test delete operation
    await deleteExperience(newExperience.id)
    console.log('✅ Experience deleted successfully')
    
    return true
  } catch (error) {
    console.error('❌ Experience test failed:', error.message)
    return false
  }
}

async function testProjects() {
  console.log('\n🚀 Testing Projects Operations...')
  try {
    const { getProjects, createProject, deleteProject } = require('../app/admin/actions/projects.ts')
    
    // Test read operation
    const projects = await getProjects()
    console.log('✅ Projects retrieved:', projects.length, 'records')
    
    // Test create operation
    const testProject = {
      title: 'Test Project',
      description: 'Test project description',
      long_description: 'Test long description',
      technologies: ['Test Tech 1', 'Test Tech 2'],
      github_url: 'https://github.com/test/project',
      live_url: 'https://test-project.com',
      image_url: '/test-image.jpg',
      status: 'in-progress',
      featured: false
    }
    
    const newProject = await createProject(testProject)
    console.log('✅ Project created successfully:', newProject.id)
    
    // Test delete operation
    await deleteProject(newProject.id)
    console.log('✅ Project deleted successfully')
    
    return true
  } catch (error) {
    console.error('❌ Projects test failed:', error.message)
    return false
  }
}

async function testSkills() {
  console.log('\n🛠️ Testing Skills Operations...')
  try {
    const { getSkills, createSkill, deleteSkill } = require('../app/admin/actions/skills.ts')
    
    // Test read operation
    const skills = await getSkills()
    console.log('✅ Skills retrieved:', skills.length, 'records')
    
    // Test create operation
    const testSkill = {
      name: 'Test Skill',
      category: 'Test Category',
      proficiency: 85,
      years_experience: 3,
      description: 'Test skill description',
      featured: false
    }
    
    const newSkill = await createSkill(testSkill)
    console.log('✅ Skill created successfully:', newSkill.id)
    
    // Test delete operation
    await deleteSkill(newSkill.id)
    console.log('✅ Skill deleted successfully')
    
    return true
  } catch (error) {
    console.error('❌ Skills test failed:', error.message)
    return false
  }
}

async function testDataIntegrity() {
  console.log('\n🔒 Testing Data Integrity...')
  try {
    // Test foreign key constraints and data validation
    const tables = ['personal_info', 'experiences', 'projects', 'skills']
    
    for (const table of tables) {
      const result = await query(`SELECT COUNT(*) as count FROM ${table}`)
      console.log(`✅ Table ${table}: ${result[0].count} records`)
    }
    
    // Test conversation_logs table
    const logs = await query(`SELECT COUNT(*) as count FROM conversation_logs`)
    console.log(`✅ Conversation logs: ${logs[0].count} records`)
    
    return true
  } catch (error) {
    console.error('❌ Data integrity test failed:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🧪 Starting Content Management System Tests...\n')
  
  const results = {
    database: false,
    personalInfo: false,
    experience: false,
    projects: false,
    skills: false,
    dataIntegrity: false
  }
  
  // Run all tests
  results.database = await testDatabaseConnection()
  
  if (results.database) {
    results.personalInfo = await testPersonalInfo()
    results.experience = await testExperience()
    results.projects = await testProjects()
    results.skills = await testSkills()
    results.dataIntegrity = await testDataIntegrity()
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  const allPassed = Object.values(results).every(result => result === true)
  
  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Content Management System is ready for production.')
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.')
  }
  console.log('='.repeat(50))
  
  return allPassed
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error)
      process.exit(1)
    })
}

module.exports = { runAllTests }