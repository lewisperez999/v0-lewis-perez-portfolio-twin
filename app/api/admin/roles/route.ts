import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkArcjetProtection } from '@/lib/arcjet'

/**
 * API endpoint to manage user roles
 * Only accessible by users with admin role
 * 
 * POST /api/admin/roles
 * Body: { userId: string, role: 'admin' | null }
 */
export async function POST(request: NextRequest) {
  try {
    // Check Arcjet protection (critical admin endpoint)
    const decision = await checkArcjetProtection(request);
    
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: decision.reason.isRateLimit() ? 'Too many requests' : 'Access denied' },
        { status: decision.reason.isRateLimit() ? 429 : 403 }
      );
    }

    // Check if requester is authenticated and has admin role
    const { userId: requesterId } = await auth()
    
    if (!requesterId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Verify requester has admin role
    const client = await clerkClient()
    const requester = await client.users.getUser(requesterId)
    const requesterRole = (requester.publicMetadata as any)?.role
    
    if (requesterRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin role required' },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { userId, role } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // Validate role value
    if (role !== 'admin' && role !== null) {
      return NextResponse.json(
        { error: 'role must be "admin" or null' },
        { status: 400 }
      )
    }
    
    // Get target user
    const targetUser = await client.users.getUser(userId)
    
    // Update user's role
    const updatedMetadata = { ...targetUser.publicMetadata }
    
    if (role === 'admin') {
      updatedMetadata.role = 'admin'
    } else {
      delete (updatedMetadata as any).role
    }
    
    await client.users.updateUserMetadata(userId, {
      publicMetadata: updatedMetadata
    })
    
    return NextResponse.json({
      success: true,
      message: role === 'admin' 
        ? `Admin role granted to ${targetUser.emailAddresses[0]?.emailAddress}`
        : `Admin role removed from ${targetUser.emailAddresses[0]?.emailAddress}`,
      user: {
        id: targetUser.id,
        email: targetUser.emailAddresses[0]?.emailAddress,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: role || undefined
      }
    })
    
  } catch (error) {
    console.error('Error managing user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/roles
 * List all users with their roles
 */
export async function GET(request: NextRequest) {
  try {
    // Check Arcjet protection (critical admin endpoint)
    const decision = await checkArcjetProtection(request);
    
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: decision.reason.isRateLimit() ? 'Too many requests' : 'Access denied' },
        { status: decision.reason.isRateLimit() ? 429 : 403 }
      );
    }

    // Check if requester is authenticated and has admin role
    const { userId: requesterId } = await auth()
    
    if (!requesterId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Verify requester has admin role
    const client = await clerkClient()
    const requester = await client.users.getUser(requesterId)
    const requesterRole = (requester.publicMetadata as any)?.role
    
    if (requesterRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin role required' },
        { status: 403 }
      )
    }
    
    // Get all users (with pagination if needed)
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const users = await client.users.getUserList({
      limit,
      offset
    })
    
    // Map users with their roles
    const usersWithRoles = users.data.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: (user.publicMetadata as any)?.role || null,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt
    }))
    
    return NextResponse.json({
      users: usersWithRoles,
      totalCount: users.totalCount,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < users.totalCount
      }
    })
    
  } catch (error) {
    console.error('Error listing users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
