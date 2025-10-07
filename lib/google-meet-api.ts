/**
 * Google Meet & Calendar API Integration with Clerk OAuth
 * Provides utilities for creating Google Meet meetings and managing calendar events
 * Uses Clerk for OAuth authentication
 */

import { google } from 'googleapis';

// Scopes required for Calendar and Meet API
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

interface GoogleMeetEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
}

interface GoogleMeetResponse {
  success: boolean;
  meetingLink?: string;
  eventId?: string;
  eventDetails?: any;
  message?: string;
  error?: string;
}

interface GoogleCalendarAvailability {
  success: boolean;
  freeSlots?: Array<{
    start: string;
    end: string;
  }>;
  busySlots?: Array<{
    start: string;
    end: string;
  }>;
  message?: string;
  error?: string;
}

/**
 * Create OAuth2 client with Lewis's Google OAuth credentials
 * This uses a single OAuth account (Lewis's) to create meetings and invite users
 */
async function createOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Missing Google OAuth credentials:');
    console.error('   GOOGLE_CLIENT_ID:', !!clientId);
    console.error('   GOOGLE_CLIENT_SECRET:', !!clientSecret);
    console.error('   GOOGLE_REFRESH_TOKEN:', !!refreshToken);
    throw new Error('Google Calendar API not configured. Missing OAuth credentials in environment variables.');
  }

  console.log('✅ Google OAuth credentials found');

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret
    // No redirect URI needed for refresh token flow
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  console.log('✅ OAuth2 client created with refresh token');
  
  // Test the token by refreshing it
  try {
    await oauth2Client.getAccessToken();
    console.log('✅ Successfully refreshed access token');
  } catch (error) {
    console.error('❌ Failed to refresh access token:', error);
    throw new Error('Invalid refresh token. Please regenerate your Google OAuth refresh token.');
  }
  
  return oauth2Client;
}

/**
 * Generate authorization URL for OAuth flow
 * @deprecated Use Clerk's OAuth connection instead
 */
export function generateAuthUrl(): string {
  throw new Error('Please use Clerk OAuth connection. Go to Clerk Dashboard > OAuth > Enable Google');
}

/**
 * Exchange authorization code for tokens
 * @deprecated Use Clerk's OAuth connection instead
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  success: boolean;
  tokens?: any;
  error?: string;
}> {
  return {
    success: false,
    error: 'Please use Clerk OAuth connection instead of manual OAuth flow',
  };
}

/**
 * Create a Google Meet meeting
 */
export async function createGoogleMeet(
  title: string,
  startTime: string,
  durationMinutes: number = 30,
  attendees: Array<{ email: string; name?: string }> = [],
  description?: string,
  timeZone: string = 'America/New_York'
): Promise<GoogleMeetResponse> {
  try {
    const oauth2Client = await createOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Calculate end time
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    // Generate unique request ID for conference
    const requestId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const event: GoogleMeetEvent = {
      summary: title,
      description: description || `Meeting scheduled via AI assistant`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: timeZone,
      },
      attendees: attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name,
      })),
      conferenceData: {
        createRequest: {
          requestId: requestId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: event,
    });

    const meetingLink = response.data.conferenceData?.entryPoints?.find(
      entry => entry.entryPointType === 'video'
    )?.uri;

    return {
      success: true,
      meetingLink: meetingLink || response.data.hangoutLink || undefined,
      eventId: response.data.id || undefined,
      eventDetails: response.data,
      message: `Google Meet created successfully for ${title}`,
    };
  } catch (error) {
    console.error('Create Google Meet error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Google Meet',
    };
  }
}

/**
 * Get calendar availability (free/busy information)
 */
export async function getCalendarAvailability(
  startDate: string,
  endDate: string,
  timeZone: string = 'America/New_York'
): Promise<GoogleCalendarAvailability> {
  try {
    const oauth2Client = await createOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(startDate).toISOString(),
        timeMax: new Date(endDate).toISOString(),
        timeZone: timeZone,
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = response.data.calendars?.primary?.busy || [];
    
    // Calculate free slots from busy slots
    const freeSlots = calculateFreeSlots(
      new Date(startDate),
      new Date(endDate),
      busySlots.map(slot => ({
        start: slot.start || '',
        end: slot.end || '',
      }))
    );

    return {
      success: true,
      freeSlots,
      busySlots: busySlots.map(slot => ({
        start: slot.start || '',
        end: slot.end || '',
      })),
      message: `Found ${freeSlots.length} available slots`,
    };
  } catch (error) {
    console.error('Get calendar availability error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get calendar availability',
    };
  }
}

/**
 * Calculate free slots from busy periods
 */
function calculateFreeSlots(
  start: Date,
  end: Date,
  busySlots: Array<{ start: string; end: string }>
): Array<{ start: string; end: string }> {
  const freeSlots: Array<{ start: string; end: string }> = [];
  
  // Sort busy slots by start time
  const sortedBusy = busySlots.sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  let currentTime = start;

  for (const busy of sortedBusy) {
    const busyStart = new Date(busy.start);
    
    // If there's a gap before the busy slot
    if (currentTime < busyStart) {
      freeSlots.push({
        start: currentTime.toISOString(),
        end: busyStart.toISOString(),
      });
    }
    
    currentTime = new Date(busy.end);
  }

  // Add final free slot if there's time left
  if (currentTime < end) {
    freeSlots.push({
      start: currentTime.toISOString(),
      end: end.toISOString(),
    });
  }

  return freeSlots;
}

/**
 * List upcoming events
 */
export async function listUpcomingEvents(
  maxResults: number = 10,
  timeMin?: string
): Promise<{
  success: boolean;
  events?: any[];
  error?: string;
}> {
  try {
    const oauth2Client = await createOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return {
      success: true,
      events: response.data.items || [],
    };
  } catch (error) {
    console.error('List upcoming events error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list events',
    };
  }
}

/**
 * Cancel a Google Meet event
 */
export async function cancelGoogleMeetEvent(
  eventId: string,
  sendUpdates: boolean = true
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const oauth2Client = await createOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: sendUpdates ? 'all' : 'none',
    });

    return {
      success: true,
      message: 'Event cancelled successfully',
    };
  } catch (error) {
    console.error('Cancel event error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel event',
    };
  }
}

/**
 * Update an existing Google Meet event
 */
export async function updateGoogleMeetEvent(
  eventId: string,
  updates: {
    title?: string;
    startTime?: string;
    durationMinutes?: number;
    attendees?: Array<{ email: string; name?: string }>;
    description?: string;
  }
): Promise<GoogleMeetResponse> {
  try {
    const oauth2Client = await createOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get existing event
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    // Prepare updates
    const updatedEvent: any = { ...existingEvent.data };

    if (updates.title) {
      updatedEvent.summary = updates.title;
    }

    if (updates.description) {
      updatedEvent.description = updates.description;
    }

    if (updates.startTime && updates.durationMinutes) {
      const startDate = new Date(updates.startTime);
      const endDate = new Date(startDate.getTime() + updates.durationMinutes * 60000);
      
      updatedEvent.start = {
        dateTime: startDate.toISOString(),
        timeZone: updatedEvent.start.timeZone || 'America/New_York',
      };
      
      updatedEvent.end = {
        dateTime: endDate.toISOString(),
        timeZone: updatedEvent.end.timeZone || 'America/New_York',
      };
    }

    if (updates.attendees) {
      updatedEvent.attendees = updates.attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name,
      }));
    }

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
      requestBody: updatedEvent,
    });

    const meetingLink = response.data.conferenceData?.entryPoints?.find(
      entry => entry.entryPointType === 'video'
    )?.uri;

    return {
      success: true,
      meetingLink: meetingLink || response.data.hangoutLink || undefined,
      eventId: response.data.id || undefined,
      eventDetails: response.data,
      message: 'Event updated successfully',
    };
  } catch (error) {
    console.error('Update event error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event',
    };
  }
}

/**
 * Find available time slots based on preferences
 */
export async function findAvailableSlots(
  startDate: string,
  endDate: string,
  durationMinutes: number = 30,
  workingHoursStart: number = 9, // 9 AM
  workingHoursEnd: number = 17, // 5 PM
  timeZone: string = 'America/New_York'
): Promise<{
  success: boolean;
  availableSlots?: Array<{ start: string; end: string }>;
  error?: string;
}> {
  try {
    const availability = await getCalendarAvailability(startDate, endDate, timeZone);

    if (!availability.success || !availability.freeSlots) {
      return {
        success: false,
        error: availability.error || 'Failed to get availability',
      };
    }

    // Filter free slots by working hours and duration
    const validSlots = availability.freeSlots.filter(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      const slotDuration = (slotEnd.getTime() - slotStart.getTime()) / 60000;
      
      const hour = slotStart.getHours();
      
      // Check if slot is within working hours and has sufficient duration
      return (
        hour >= workingHoursStart &&
        hour < workingHoursEnd &&
        slotDuration >= durationMinutes
      );
    });

    return {
      success: true,
      availableSlots: validSlots,
    };
  } catch (error) {
    console.error('Find available slots error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find available slots',
    };
  }
}

export type {
  GoogleMeetEvent,
  GoogleMeetResponse,
  GoogleCalendarAvailability,
};
