/**
 * Calendly API Integration
 * Provides utilities for interacting with Calendly's REST API
 */

const CALENDLY_API_BASE = 'https://api.calendly.com';
const CALENDLY_API_KEY = process.env.CALENDLY_API_KEY;
const CALENDLY_USER_URI = process.env.CALENDLY_USER_URI; // e.g., https://api.calendly.com/users/XXXXXX

interface CalendlyEventType {
  uri: string;
  name: string;
  slug: string;
  duration: number;
  active: boolean;
  scheduling_url: string;
  description_plain?: string;
}

interface CalendlyAvailability {
  available: boolean;
  slots: string[];
  message?: string;
}

interface CalendlyBookingRequest {
  event_type_uri: string;
  invitee_email: string;
  invitee_name: string;
  start_time: string;
  timezone?: string;
  additional_info?: Record<string, any>;
}

interface CalendlyBookingResponse {
  success: boolean;
  booking_url?: string;
  event_uri?: string;
  message?: string;
  error?: string;
}

/**
 * Make an authenticated request to Calendly API
 */
async function calendlyFetch(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  if (!CALENDLY_API_KEY) {
    throw new Error('CALENDLY_API_KEY environment variable is not set');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${CALENDLY_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CALENDLY_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}

/**
 * Get the current user's information from Calendly
 */
export async function getCurrentUser() {
  try {
    const response = await calendlyFetch('/users/me');
    
    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      user: data.resource
    };
  } catch (error) {
    console.error('Calendly getCurrentUser error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get all active event types for the user
 */
export async function getEventTypes(): Promise<{ success: boolean; eventTypes?: CalendlyEventType[]; error?: string }> {
  try {
    if (!CALENDLY_USER_URI) {
      throw new Error('CALENDLY_USER_URI environment variable is not set');
    }

    const response = await calendlyFetch(`/event_types?user=${CALENDLY_USER_URI}&active=true`);
    
    if (!response.ok) {
      throw new Error(`Failed to get event types: ${response.statusText}`);
    }

    const data = await response.json();
    const eventTypes = data.collection || [];

    return {
      success: true,
      eventTypes: eventTypes.map((et: any) => ({
        uri: et.uri,
        name: et.name,
        slug: et.slug,
        duration: et.duration,
        active: et.active,
        scheduling_url: et.scheduling_url,
        description_plain: et.description_plain,
      }))
    };
  } catch (error) {
    console.error('Calendly getEventTypes error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get available time slots for a specific event type
 * Note: Calendly doesn't provide a direct availability API endpoint
 * This function returns a helpful message directing users to the scheduling page
 */
export async function getAvailability(
  eventTypeUri: string,
  startDate: string,
  endDate: string
): Promise<CalendlyAvailability> {
  try {
    // Calendly doesn't expose availability slots via API
    // Users need to be directed to the scheduling URL
    const eventTypesResponse = await getEventTypes();
    
    if (!eventTypesResponse.success || !eventTypesResponse.eventTypes) {
      return {
        available: false,
        slots: [],
        message: 'Unable to retrieve event type information'
      };
    }

    const eventType = eventTypesResponse.eventTypes.find(et => et.uri === eventTypeUri);
    
    if (!eventType) {
      return {
        available: false,
        slots: [],
        message: 'Event type not found'
      };
    }

    return {
      available: true,
      slots: [],
      message: `To view available time slots, please visit: ${eventType.scheduling_url}`
    };
  } catch (error) {
    console.error('Calendly getAvailability error:', error);
    return {
      available: false,
      slots: [],
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get scheduled events (invitees) for the user
 */
export async function getScheduledEvents(
  minStartTime?: string,
  maxStartTime?: string
): Promise<{ success: boolean; events?: any[]; error?: string }> {
  try {
    if (!CALENDLY_USER_URI) {
      throw new Error('CALENDLY_USER_URI environment variable is not set');
    }

    let url = `/scheduled_events?user=${CALENDLY_USER_URI}`;
    
    if (minStartTime) {
      url += `&min_start_time=${encodeURIComponent(minStartTime)}`;
    }
    if (maxStartTime) {
      url += `&max_start_time=${encodeURIComponent(maxStartTime)}`;
    }

    const response = await calendlyFetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to get scheduled events: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      events: data.collection || []
    };
  } catch (error) {
    console.error('Calendly getScheduledEvents error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a scheduling link with pre-filled information
 * This is the recommended approach since Calendly doesn't allow direct booking via API
 */
export async function createSchedulingLink(
  inviteeName: string,
  inviteeEmail: string,
  eventTypeSlug?: string
): Promise<CalendlyBookingResponse> {
  try {
    // Get event types to find the appropriate one
    const eventTypesResponse = await getEventTypes();
    
    if (!eventTypesResponse.success || !eventTypesResponse.eventTypes) {
      return {
        success: false,
        error: 'Unable to retrieve event types'
      };
    }

    // Use the first active event type or find by slug
    let eventType = eventTypesResponse.eventTypes[0];
    
    if (eventTypeSlug) {
      const foundEventType = eventTypesResponse.eventTypes.find(
        et => et.slug === eventTypeSlug
      );
      if (foundEventType) {
        eventType = foundEventType;
      }
    }

    if (!eventType) {
      return {
        success: false,
        error: 'No active event types found'
      };
    }

    // Build scheduling URL with pre-filled parameters
    const params = new URLSearchParams();
    params.append('name', inviteeName);
    params.append('email', inviteeEmail);

    const schedulingUrl = `${eventType.scheduling_url}?${params.toString()}`;

    return {
      success: true,
      booking_url: schedulingUrl,
      event_uri: eventType.uri,
      message: `Scheduling link created for ${eventType.name} (${eventType.duration} minutes)`
    };
  } catch (error) {
    console.error('Calendly createSchedulingLink error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Cancel a scheduled event (requires the event UUID)
 */
export async function cancelEvent(
  eventUri: string,
  reason?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await calendlyFetch(eventUri, {
      method: 'DELETE',
      body: reason ? JSON.stringify({ reason }) : undefined,
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to cancel event: ${response.statusText}`);
    }

    return {
      success: true,
      message: 'Event cancelled successfully'
    };
  } catch (error) {
    console.error('Calendly cancelEvent error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Helper function to get a user-friendly event type description
 */
export async function getEventTypeInfo(
  slug?: string
): Promise<{ success: boolean; info?: string; eventTypes?: CalendlyEventType[]; error?: string }> {
  try {
    const response = await getEventTypes();
    
    if (!response.success || !response.eventTypes) {
      return {
        success: false,
        error: response.error || 'Unable to retrieve event types'
      };
    }

    const eventTypes = response.eventTypes;

    if (eventTypes.length === 0) {
      return {
        success: false,
        error: 'No active event types available'
      };
    }

    // If slug is provided, find specific event type
    if (slug) {
      const eventType = eventTypes.find(et => et.slug === slug);
      if (eventType) {
        const info = `${eventType.name} - ${eventType.duration} minutes. ${eventType.description_plain || ''}`;
        return {
          success: true,
          info,
          eventTypes: [eventType]
        };
      }
    }

    // Return all event types
    const info = eventTypes
      .map(et => `- ${et.name} (${et.duration} min): ${et.scheduling_url}`)
      .join('\n');

    return {
      success: true,
      info: `Available meeting types:\n${info}`,
      eventTypes
    };
  } catch (error) {
    console.error('Calendly getEventTypeInfo error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate webhook signature (for webhook endpoint security)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
}

export type {
  CalendlyEventType,
  CalendlyAvailability,
  CalendlyBookingRequest,
  CalendlyBookingResponse,
};
