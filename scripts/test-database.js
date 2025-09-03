import { testConnection, getDatabaseHealth } from '../lib/database.js'

async function main() {
  try {
    console.log('Testing database connection...')
    
    const isConnected = await testConnection()
    console.log('Database connection test:', isConnected ? 'SUCCESS' : 'FAILED')
    
    const health = await getDatabaseHealth()
    console.log('Database health:', health)
    
    process.exit(0)
  } catch (error) {
    console.error('Database test error:', error.message)
    process.exit(1)
  }
}

main()