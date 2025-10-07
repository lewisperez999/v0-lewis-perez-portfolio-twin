'use server';

/**
 * Server actions for Google Meet operations
 * These are called from the realtime tools (client-side) but execute on the server
 */

export async function createMeetingAction(args: {
  title: string;
  attendeeEmail: string;
  attendeeName: string;
  startTime: string;
  durationMinutes?: number;
  description?: string;
  timeZone?: string;
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/google-meet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-meet',
        title: args.title,
        startTime: args.startTime,
        durationMinutes: args.durationMinutes || 30,
        attendees: [
          { email: args.attendeeEmail, name: args.attendeeName },
          { email: 'lewisperez12152017@gmail.com', name: 'Lewis Perez' }
        ],
        description: args.description,
        timeZone: args.timeZone || 'America/New_York'
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('createMeetingAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create meeting'
    };
  }
}

export async function checkAvailabilityAction(args: {
  startDate: string;
  endDate: string;
  timeZone?: string;
}) {
  try {
    const params = new URLSearchParams({
      action: 'availability',
      startDate: args.startDate,
      endDate: args.endDate,
      timeZone: args.timeZone || 'America/New_York'
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/google-meet?${params}`
    );

    return await response.json();
  } catch (error) {
    console.error('checkAvailabilityAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check availability'
    };
  }
}

export async function findSlotsAction(args: {
  startDate: string;
  endDate: string;
  durationMinutes?: number;
  workingHoursStart?: number;
  workingHoursEnd?: number;
}) {
  try {
    const params = new URLSearchParams({
      action: 'available-slots',
      startDate: args.startDate,
      endDate: args.endDate,
      durationMinutes: String(args.durationMinutes || 30),
      workingHoursStart: String(args.workingHoursStart || 9),
      workingHoursEnd: String(args.workingHoursEnd || 17)
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/google-meet?${params}`
    );

    return await response.json();
  } catch (error) {
    console.error('findSlotsAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find slots'
    };
  }
}

export async function getUpcomingMeetingsAction(args: {
  maxResults?: number;
  timeMin?: string;
}) {
  try {
    const params = new URLSearchParams({
      action: 'upcoming-events',
      maxResults: String(args.maxResults || 10)
    });

    if (args.timeMin) {
      params.append('timeMin', args.timeMin);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/google-meet?${params}`
    );

    return await response.json();
  } catch (error) {
    console.error('getUpcomingMeetingsAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get meetings'
    };
  }
}
