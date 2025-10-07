import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createGoogleMeet,
  getCalendarAvailability,
  findAvailableSlots,
  listUpcomingEvents,
  cancelGoogleMeetEvent,
  updateGoogleMeetEvent,
} from '@/lib/google-meet-api';
import { hasGoogleOAuthConnected } from '@/app/actions/google-oauth';

/**
 * Google Meet API Route Handler (with Clerk OAuth)
 * Handles Google Calendar and Google Meet API requests using Clerk authentication
 */

// GET handler - Query calendar information
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'check-connection': {
        // Check if Google OAuth is connected
        const result = await hasGoogleOAuthConnected();
        return NextResponse.json({
          success: true,
          connected: result.connected,
          message: result.connected 
            ? 'Google Calendar is connected' 
            : 'Please connect your Google account in settings',
        });
      }

      case 'availability': {
        // Get calendar availability
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const timeZone = searchParams.get('timeZone') || 'America/New_York';

        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'startDate and endDate are required' },
            { status: 400 }
          );
        }

        const result = await getCalendarAvailability(startDate, endDate, timeZone);
        return NextResponse.json(result);
      }

      case 'available-slots': {
        // Find available meeting slots
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const durationMinutes = parseInt(searchParams.get('durationMinutes') || '30');
        const workingHoursStart = parseInt(searchParams.get('workingHoursStart') || '9');
        const workingHoursEnd = parseInt(searchParams.get('workingHoursEnd') || '17');

        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'startDate and endDate are required' },
            { status: 400 }
          );
        }

        const result = await findAvailableSlots(
          startDate,
          endDate,
          durationMinutes,
          workingHoursStart,
          workingHoursEnd
        );
        return NextResponse.json(result);
      }

      case 'upcoming-events': {
        // List upcoming events
        const maxResults = parseInt(searchParams.get('maxResults') || '10');
        const timeMin = searchParams.get('timeMin') || undefined;

        const result = await listUpcomingEvents(maxResults, timeMin);
        return NextResponse.json(result);
      }

      case 'health': {
        // Health check endpoint
        return NextResponse.json({
          success: true,
          message: 'Google Meet API route is operational',
          timestamp: new Date().toISOString(),
        });
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            availableActions: [
              'auth-url',
              'availability',
              'available-slots',
              'upcoming-events',
              'health',
            ],
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Google Meet API GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST handler - Create or modify calendar events
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'connect-google': {
        // Provide instructions for connecting Google via Clerk
        return NextResponse.json({
          success: true,
          message: 'Please go to your user profile settings and connect your Google account.',
          instructions: [
            '1. Click on your profile in the top right',
            '2. Go to "Connected Accounts"',
            '3. Click "Connect" next to Google',
            '4. Grant calendar permissions',
          ],
        });
      }

      case 'create-meet': {
        // Create a new Google Meet
        const {
          title,
          startTime,
          durationMinutes,
          attendees,
          description,
          timeZone,
        } = body;

        if (!title || !startTime) {
          return NextResponse.json(
            { success: false, error: 'title and startTime are required' },
            { status: 400 }
          );
        }

        const result = await createGoogleMeet(
          title,
          startTime,
          durationMinutes || 30,
          attendees || [],
          description,
          timeZone || 'America/New_York'
        );

        return NextResponse.json(result);
      }

      case 'cancel-event': {
        // Cancel a calendar event
        const { eventId, sendUpdates } = body;

        if (!eventId) {
          return NextResponse.json(
            { success: false, error: 'eventId is required' },
            { status: 400 }
          );
        }

        const result = await cancelGoogleMeetEvent(eventId, sendUpdates !== false);
        return NextResponse.json(result);
      }

      case 'update-event': {
        // Update a calendar event
        const { eventId, updates } = body;

        if (!eventId || !updates) {
          return NextResponse.json(
            { success: false, error: 'eventId and updates are required' },
            { status: 400 }
          );
        }

        const result = await updateGoogleMeetEvent(eventId, updates);
        return NextResponse.json(result);
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            availableActions: [
              'connect-google',
              'create-meet',
              'cancel-event',
              'update-event',
            ],
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Google Meet API POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
