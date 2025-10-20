#!/usr/bin/env ts-node
/**
 * Script to set admin role for a user
 * 
 * Usage: 
 *   pnpm ts-node scripts/set-admin-role.ts <user-email>
 * 
 * Example:
 *   pnpm ts-node scripts/set-admin-role.ts admin@example.com
 */

import { clerkClient } from '@clerk/nextjs/server'

async function setAdminRole(email: string) {
  try {
    console.log(`🔍 Looking up user with email: ${email}`)
    
    // Get client instance
    const client = await clerkClient()
    
    // Find user by email
    const users = await client.users.getUserList({
      emailAddress: [email]
    })
    
    if (users.data.length === 0) {
      console.error(`❌ No user found with email: ${email}`)
      process.exit(1)
    }
    
    const user = users.data[0]
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.id})`)
    
    // Update user's public metadata to add admin role
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: 'admin'
      }
    })
    
    console.log(`✅ Successfully set admin role for ${email}`)
    console.log(`\n📝 User needs to sign out and sign back in for changes to take effect.`)
    
  } catch (error) {
    console.error('❌ Error setting admin role:', error)
    process.exit(1)
  }
}

async function removeAdminRole(email: string) {
  try {
    console.log(`🔍 Looking up user with email: ${email}`)
    
    // Get client instance
    const client = await clerkClient()
    
    // Find user by email
    const users = await client.users.getUserList({
      emailAddress: [email]
    })
    
    if (users.data.length === 0) {
      console.error(`❌ No user found with email: ${email}`)
      process.exit(1)
    }
    
    const user = users.data[0]
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.id})`)
    
    // Remove admin role from public metadata
    const { role, ...restMetadata } = user.publicMetadata as any
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: restMetadata
    })
    
    console.log(`✅ Successfully removed admin role from ${email}`)
    console.log(`\n📝 User needs to sign out and sign back in for changes to take effect.`)
    
  } catch (error) {
    console.error('❌ Error removing admin role:', error)
    process.exit(1)
  }
}

async function listAdmins() {
  try {
    console.log(`🔍 Listing all admin users...`)
    
    // Get client instance
    const client = await clerkClient()
    
    // Get all users (you may need to paginate for large user bases)
    const users = await client.users.getUserList()
    
    const admins = users.data.filter(user => {
      const metadata = user.publicMetadata as any
      return metadata?.role === 'admin'
    })
    
    if (admins.length === 0) {
      console.log(`\n⚠️  No admin users found`)
    } else {
      console.log(`\n✅ Found ${admins.length} admin user(s):\n`)
      admins.forEach(admin => {
        console.log(`  • ${admin.firstName} ${admin.lastName}`)
        console.log(`    Email: ${admin.emailAddresses[0]?.emailAddress || 'N/A'}`)
        console.log(`    User ID: ${admin.id}`)
        console.log(`    Created: ${new Date(admin.createdAt).toLocaleDateString()}\n`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error listing admins:', error)
    process.exit(1)
  }
}

// Main execution
const args = process.argv.slice(2)
const command = args[0]
const email = args[1]

if (!command) {
  console.log(`
Admin Role Management Script
============================

Commands:
  set <email>     - Set admin role for user with given email
  remove <email>  - Remove admin role from user with given email
  list            - List all users with admin role

Examples:
  pnpm ts-node scripts/set-admin-role.ts set admin@example.com
  pnpm ts-node scripts/set-admin-role.ts remove user@example.com
  pnpm ts-node scripts/set-admin-role.ts list
  `)
  process.exit(0)
}

switch (command) {
  case 'set':
    if (!email) {
      console.error('❌ Email address is required')
      console.log('Usage: pnpm ts-node scripts/set-admin-role.ts set <email>')
      process.exit(1)
    }
    setAdminRole(email)
    break
    
  case 'remove':
    if (!email) {
      console.error('❌ Email address is required')
      console.log('Usage: pnpm ts-node scripts/set-admin-role.ts remove <email>')
      process.exit(1)
    }
    removeAdminRole(email)
    break
    
  case 'list':
    listAdmins()
    break
    
  default:
    console.error(`❌ Unknown command: ${command}`)
    console.log('Valid commands: set, remove, list')
    process.exit(1)
}
