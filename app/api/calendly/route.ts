import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentUser,
  getEventTypes,
  getScheduledEvents,
  createSchedulingLink,
  getEventTypeInfo,
} from '@/lib/calendly-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/calendly
 * Query parameters:
 * - action: 'user' | 'event-types' | 'scheduled-events' | 'event-info'
 * - slug: event type slug (for event-info action)
 * - minStartTime: ISO date string (for scheduled-events)
 * - maxStartTime: ISO date string (for scheduled-events)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'event-types';

    switch (action) {
      case 'user': {
        const result = await getCurrentUser();
        return NextResponse.json(result);
      }

      case 'event-types': {
        const result = await getEventTypes();
        return NextResponse.json(result);
      }

      case 'scheduled-events': {
        const minStartTime = searchParams.get('minStartTime') || undefined;
        const maxStartTime = searchParams.get('maxStartTime') || undefined;
        
        const result = await getScheduledEvents(minStartTime, maxStartTime);
        return NextResponse.json(result);
      }

      case 'event-info': {
        const slug = searchParams.get('slug') || undefined;
        const result = await getEventTypeInfo(slug);
        return NextResponse.json(result);
      }

      default: {
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Calendly API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendly
 * Body:
 * - action: 'create-link'
 * - name: invitee name
 * - email: invitee email
 * - eventTypeSlug: optional event type slug
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, name, email, eventTypeSlug } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create-link': {
        if (!name || !email) {
          return NextResponse.json(
            { success: false, error: 'Name and email are required' },
            { status: 400 }
          );
        }

        const result = await createSchedulingLink(name, email, eventTypeSlug);
        return NextResponse.json(result);
      }

      default: {
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Calendly API POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
