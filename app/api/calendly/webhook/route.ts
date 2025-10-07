import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/calendly/webhook
 * Handles Calendly webhook events
 * 
 * Webhook events include:
 * - invitee.created: New booking created
 * - invitee.canceled: Booking canceled
 * - invitee_no_show.created: Invitee marked as no-show
 * - routing_form_submission.created: Routing form submitted
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.CALENDLY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('CALENDLY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Get the webhook signature from headers
    const signature = request.headers.get('calendly-webhook-signature');
    const payload = await request.text();

    // Validate webhook signature
    if (signature) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      // Use timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse the webhook payload
    const event = JSON.parse(payload);
    
    console.log('Calendly webhook received:', {
      event: event.event,
      created_at: event.created_at,
      payload_keys: Object.keys(event.payload || {}),
    });

    // Handle different event types
    switch (event.event) {
      case 'invitee.created': {
        // New booking created
        const invitee = event.payload;
        console.log('New booking created:', {
          name: invitee.name,
          email: invitee.email,
          event_uri: invitee.event?.uri,
          scheduled_event_uri: invitee.scheduled_event?.uri,
        });

        // TODO: Add your custom logic here:
        // - Send confirmation email
        // - Update CRM
        // - Trigger notifications
        // - Store booking in database
        // - Send Slack/Discord notification

        break;
      }

      case 'invitee.canceled': {
        // Booking canceled
        const invitee = event.payload;
        console.log('Booking canceled:', {
          name: invitee.name,
          email: invitee.email,
          cancellation_reason: invitee.cancellation?.reason,
        });

        // TODO: Add your custom logic here:
        // - Send cancellation confirmation
        // - Update CRM status
        // - Free up resources
        // - Notify relevant parties

        break;
      }

      case 'invitee_no_show.created': {
        // Invitee marked as no-show
        const noShow = event.payload;
        console.log('No-show recorded:', {
          invitee_uri: noShow.invitee?.uri,
        });

        // TODO: Add your custom logic here:
        // - Update attendance records
        // - Send follow-up email
        // - Update CRM

        break;
      }

      case 'routing_form_submission.created': {
        // Routing form submitted
        const submission = event.payload;
        console.log('Routing form submitted:', {
          submitter_email: submission.submitter?.email,
        });

        // TODO: Add your custom logic here:
        // - Process routing form data
        // - Route to appropriate event type
        // - Send follow-up

        break;
      }

      default: {
        console.log('Unhandled webhook event type:', event.event);
      }
    }

    // Respond to Calendly that webhook was received
    return NextResponse.json({ success: true, received: true });

  } catch (error) {
    console.error('Calendly webhook error:', error);
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
 * GET /api/calendly/webhook
 * Endpoint to verify webhook is accessible
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Calendly webhook endpoint is active',
    supportedEvents: [
      'invitee.created',
      'invitee.canceled',
      'invitee_no_show.created',
      'routing_form_submission.created',
    ],
  });
}
