'use server';

import { auth } from '@clerk/nextjs/server';

/**
 * Get Google OAuth token from Clerk
 * This server action securely retrieves the user's Google OAuth token
 */
export async function getGoogleOAuthToken(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated. Please sign in.',
      };
    }

    // Get JWT with Google OAuth token from Clerk template
    // The JWT contains a 'google_token' claim with the access token
    const jwt = await getToken({ template: 'google_calendar' });

    if (!jwt) {
      return {
        success: false,
        error: 'Google Calendar access not granted. Please connect your Google account in your profile settings.',
      };
    }

    // Decode the JWT to get the google_token claim
    // The JWT is already validated by Clerk
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      const token = payload.google_token;

      if (!token) {
        return {
          success: false,
          error: 'Google token not found in JWT. Verify JWT template has "google_token" claim with Google access token shortcode.',
        };
      }

      return {
        success: true,
        token,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to decode JWT token.',
      };
    }
  } catch (error) {
    console.error('Error getting Google OAuth token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Google OAuth token',
    };
  }
}

/**
 * Check if user has Google OAuth connected
 */
export async function hasGoogleOAuthConnected(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return {
        connected: false,
        error: 'User not authenticated',
      };
    }

    const token = await getToken({ template: 'google_calendar' });

    return {
      connected: !!token,
    };
  } catch (error) {
    console.error('Error checking Google OAuth connection:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Failed to check connection',
    };
  }
}

/**
 * Get user's Clerk ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}
