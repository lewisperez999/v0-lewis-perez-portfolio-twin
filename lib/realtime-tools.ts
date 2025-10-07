import { generateAIResponse, searchProfessionalContent, getSuggestedQuestions } from "@/app/actions/chat";
import { getPersonalInfo } from "@/app/admin/actions/personal-info";
import { getExperiences } from "@/app/admin/actions/experience";
import { getSkillsByCategory } from "@/app/admin/actions/skills";

// Tool definitions for OpenAI Realtime API
export const realtimeTools = [
  {
    type: "function",
    name: "search_professional_content",
    description: "Search Lewis's professional content including experience, skills, and projects",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant professional information"
        }
      },
      required: ["query"]
    }
  },
  {
    type: "function", 
    name: "get_detailed_experience",
    description: "Get detailed information about Lewis's work experience at specific companies",
    parameters: {
      type: "object",
      properties: {
        company: {
          type: "string",
          description: "Optional company name to filter by (e.g., 'ING', 'Amdocs')"
        }
      }
    }
  },
  {
    type: "function",
    name: "get_technical_skills",
    description: "Get Lewis's technical skills organized by category with proficiency levels",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional skill category to filter by (e.g., 'Programming Languages', 'Cloud & DevOps')"
        }
      }
    }
  },
  {
    type: "function",
    name: "get_suggested_questions",
    description: "Get suggested questions that users commonly ask about Lewis's background",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    type: "function",
    name: "get_conversation_context",
    description: "Get contextual information based on the conversation topic using RAG",
    parameters: {
      type: "object", 
      properties: {
        topic: {
          type: "string",
          description: "The topic or question to get relevant context for"
        }
      },
      required: ["topic"]
    }
  },
  {
    type: "function",
    name: "schedule_google_meet",
    description: "Creates calendar event with Google Meet link. ONLY call this AFTER confirming time slot is available using check_google_calendar_availability. User's name/email retrieved automatically. Ask for: meeting topic, preferred time, duration (default 30min).",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Meeting title (e.g., 'Technical Discussion', 'Job Interview')"
        },
        startTime: {
          type: "string",
          description: "ISO 8601 datetime format: YYYY-MM-DDTHH:mm:ss (e.g., '2025-10-05T14:00:00' for today 2pm). CRITICAL: Use 24-hour time (2pm=14:00, 3pm=15:00). DO NOT include timezone offset. Just the date and time in format YYYY-MM-DDTHH:mm:ss"
        },
        durationMinutes: {
          type: "number",
          description: "Duration in minutes (default: 30)"
        },
        description: {
          type: "string",
          description: "Optional meeting description"
        },
        timeZone: {
          type: "string",
          description: "User's timezone (auto-detected from browser)"
        }
      },
      required: ["title", "startTime"]
    }
  },
  {
    type: "function",
    name: "check_google_calendar_availability",
    description: "ALWAYS call this FIRST before scheduling any meeting. Checks Lewis's Google Calendar for free/busy times. If busy at requested time, inform user and suggest calling find_available_meeting_slots to find alternatives. Returns free and busy time slots.",
    parameters: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "Start datetime in format: YYYY-MM-DDTHH:mm:ss (e.g., '2025-10-05T14:00:00'). Use 24-hour time."
        },
        endDate: {
          type: "string",
          description: "End datetime in format: YYYY-MM-DDTHH:mm:ss (e.g., '2025-10-05T14:30:00'). Should be startDate + duration."
        },
        timeZone: {
          type: "string",
          description: "User's timezone (optional, auto-detected)"
        }
      },
      required: ["startDate", "endDate"]
    }
  },
  {
    type: "function",
    name: "find_available_meeting_slots",
    description: "Call this when requested time is busy or user asks 'when are you available'. Finds specific available time slots matching meeting duration and working hours (9am-5pm default). Returns list of free slots to offer as alternatives.",
    parameters: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "Start date for slot search in ISO 8601 format (e.g., '2025-10-15T00:00:00Z')"
        },
        endDate: {
          type: "string",
          description: "End date for slot search in ISO 8601 format (e.g., '2025-10-20T23:59:59Z')"
        },
        durationMinutes: {
          type: "number",
          description: "Required meeting duration in minutes (default: 30). Use this to filter slots."
        },
        workingHoursStart: {
          type: "number",
          description: "Working hours start time in 24-hour format (default: 9 for 9 AM)"
        },
        workingHoursEnd: {
          type: "number",
          description: "Working hours end time in 24-hour format (default: 17 for 5 PM)"
        }
      },
      required: ["startDate", "endDate"]
    }
  },
  {
    type: "function",
    name: "get_upcoming_meetings",
    description: "Use this when user asks 'what meetings do you have', 'show your schedule', 'what's coming up', or wants to see Lewis's existing commitments. Returns list of scheduled meetings from Google Calendar.",
    parameters: {
      type: "object",
      properties: {
        maxResults: {
          type: "number",
          description: "Maximum number of meetings to return (default: 10, max: 50)"
        },
        timeMin: {
          type: "string",
          description: "Optional: Start time for events in ISO 8601 format (default: current time)"
        }
      }
    }
  }
];

// Tool handlers that use your existing chat functions
export const toolHandlers = {
  search_professional_content: async (args: { query: string }) => {
    try {
      const results = await searchProfessionalContent(args.query);
      return {
        success: true,
        results: results.results.map(r => ({
          content: r.content,
          relevance: r.score,
          type: r.metadata?.chunk_type || 'general'
        })),
        totalResults: results.totalResults
      };
    } catch (error) {
      return { success: false, error: 'Failed to search content' };
    }
  },

  get_detailed_experience: async (args: { company?: string }) => {
    try {
      const experiences = await getExperiences();
      const filtered = args.company 
        ? experiences.filter(exp => exp.company.toLowerCase().includes(args.company!.toLowerCase()))
        : experiences;
      
      return {
        success: true,
        experiences: filtered.map(exp => ({
          company: exp.company,
          position: exp.position,
          duration: exp.duration,
          description: exp.description,
          achievements: exp.achievements,
          technologies: exp.technologies
        }))
      };
    } catch (error) {
      return { success: false, error: 'Failed to get experience data' };
    }
  },

  get_technical_skills: async (args: { category?: string }) => {
    try {
      const skillsByCategory = await getSkillsByCategory();
      const filtered = args.category 
        ? { [args.category]: skillsByCategory[args.category] || [] }
        : skillsByCategory;
      
      return {
        success: true,
        skillsByCategory: filtered
      };
    } catch (error) {
      return { success: false, error: 'Failed to get skills data' };
    }
  },

  get_suggested_questions: async () => {
    try {
      const questions = await getSuggestedQuestions();
      return {
        success: true,
        questions
      };
    } catch (error) {
      return { success: false, error: 'Failed to get suggested questions' };
    }
  },

  get_conversation_context: async (args: { topic: string }) => {
    try {
      // Use your existing generateAIResponse logic for context
      const response = await generateAIResponse(args.topic, [], undefined, {
        responseFormat: "concise",
        includeSources: true
      });
      
      return {
        success: true,
        context: response.response,
        sources: response.sources
      };
    } catch (error) {
      return { success: false, error: 'Failed to get conversation context' };
    }
  },

  schedule_google_meet: async (args: {
    title: string;
    startTime: string;
    durationMinutes?: number;
    description?: string;
    timeZone?: string;
  }) => {
    try {
      // Get user info from Clerk
      const userResponse = await fetch('/api/user');
      
      if (!userResponse.ok) {
        return {
          success: false,
          error: 'Unable to retrieve user information. Please make sure you are signed in.'
        };
      }

      let userData;
      try {
        userData = await userResponse.json();
      } catch (jsonError) {
        console.error('Failed to parse user response:', jsonError);
        return {
          success: false,
          error: 'Invalid user data. Please try refreshing the page and signing in again.'
        };
      }
      
      if (!userData.success || !userData.user?.primaryEmailAddress) {
        return {
          success: false,
          error: 'Unable to retrieve user email. Please make sure you are signed in.'
        };
      }

      const userEmail = userData.user.primaryEmailAddress;
      const userName = userData.user.firstName 
        ? `${userData.user.firstName} ${userData.user.lastName || ''}`.trim()
        : userEmail.split('@')[0];

      // Detect user's timezone (browser will provide this)
      const userTimezone = args.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Call the API route to create Google Meet
      const response = await fetch('/api/google-meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-meet',
          title: args.title,
          startTime: args.startTime,
          durationMinutes: args.durationMinutes || 30,
          attendees: [
            { email: userEmail, name: userName },
            { email: 'lewisperez12152017@gmail.com', name: 'Lewis Perez' }
          ],
          description: args.description,
          timeZone: userTimezone
        })
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: `I apologize, but I encountered an issue creating the Google Meet: ${result.error}. Would you like to try booking via Calendly instead?`,
          error: result.error
        };
      }

      const startDate = new Date(args.startTime);
      const formattedDate = startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: args.timeZone || 'America/New_York'
      });

      let message = `Perfect! I've created a Google Meet for "${args.title}" `;
      message += `scheduled for ${formattedDate}. `;
      message += `\n\n📅 Meeting Details:\n`;
      message += `• Duration: ${args.durationMinutes || 30} minutes\n`;
      message += `• Attendees: ${userName} (${userEmail}) and Lewis Perez\n`;
      message += `• Video Link: ${result.meetingLink}\n\n`;
      message += `Calendar invitations have been sent to both attendees. `;
      message += `You can join the meeting using the link above or through your Google Calendar.`;

      return {
        success: true,
        message: message,
        meetingLink: result.meetingLink,
        eventId: result.eventId,
        attendeeEmail: userEmail
      };
    } catch (error) {
      console.error('schedule_google_meet error:', error);
      return {
        success: false,
        message: 'I encountered an error creating the Google Meet. Would you like to try scheduling via Calendly instead?',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  check_google_calendar_availability: async (args: {
    startDate: string;
    endDate: string;
    timeZone?: string;
  }) => {
    try {
      const response = await fetch(`/api/google-meet?action=availability&startDate=${encodeURIComponent(args.startDate)}&endDate=${encodeURIComponent(args.endDate)}&timeZone=${encodeURIComponent(args.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone)}`);
      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: `I'm having trouble checking the calendar availability: ${result.error}`,
          error: result.error
        };
      }

      const startDate = new Date(args.startDate);
      const endDate = new Date(args.endDate);
      const busySlots = result.busySlots || [];

      // Check if the requested time slot has a conflict
      const hasConflict = busySlots.some((busy: any) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        // Check for overlap
        return (startDate < busyEnd && endDate > busyStart);
      });

      let message = '';

      if (hasConflict) {
        message = `⚠️ I'm sorry, but Lewis already has a meeting scheduled during that time. `;
        
        const conflictingMeeting = busySlots.find((busy: any) => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return (startDate < busyEnd && endDate > busyStart);
        });

        if (conflictingMeeting) {
          const conflictStart = new Date(conflictingMeeting.start).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: args.timeZone
          });
          const conflictEnd = new Date(conflictingMeeting.end).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: args.timeZone
          });
          message += `There's a conflict from ${conflictStart} to ${conflictEnd}. `;
        }

        message += `Would you like me to find alternative available times?`;

        return {
          success: true,
          available: false,
          hasConflict: true,
          message: message,
          busySlots: result.busySlots
        };
      }

      // Time slot is free
      message = `✅ Great news! Lewis is available during that time. Would you like me to schedule a Google Meet?`;

      if (result.freeSlots && result.freeSlots.length > 1) {
        message += `\n\nThere are ${result.freeSlots.length} available time slots in this period if you'd like to see other options.`;
      }

      return {
        success: true,
        available: true,
        hasConflict: false,
        message: message,
        freeSlots: result.freeSlots,
        busySlots: result.busySlots
      };
    } catch (error) {
      console.error('check_google_calendar_availability error:', error);
      return {
        success: false,
        message: 'I encountered an error checking calendar availability.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  find_available_meeting_slots: async (args: {
    startDate: string;
    endDate: string;
    durationMinutes?: number;
    workingHoursStart?: number;
    workingHoursEnd?: number;
  }) => {
    try {
      const params = new URLSearchParams({
        action: 'available-slots',
        startDate: args.startDate,
        endDate: args.endDate,
        durationMinutes: String(args.durationMinutes || 30),
        workingHoursStart: String(args.workingHoursStart || 9),
        workingHoursEnd: String(args.workingHoursEnd || 17)
      });

      const response = await fetch(`/api/google-meet?${params}`);
      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: `I'm having trouble finding available slots: ${result.error}`,
          error: result.error
        };
      }

      const duration = args.durationMinutes || 30;
      let message = `I've found available ${duration}-minute meeting slots during business hours:\n\n`;

      if (result.availableSlots && result.availableSlots.length > 0) {
        message += `📅 Available Slots:\n`;
        result.availableSlots.slice(0, 10).forEach((slot: any, index: number) => {
          const start = new Date(slot.start).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          });
          message += `${index + 1}. ${start}\n`;
        });

        if (result.availableSlots.length > 10) {
          message += `\n...and ${result.availableSlots.length - 10} more slots available.\n`;
        }

        message += `\nWould you like me to book a Google Meet for any of these times? Just let me know which slot works best for you!`;
      } else {
        message += `Unfortunately, I couldn't find any available ${duration}-minute slots during the specified timeframe. `;
        message += `Would you like to try a different duration or date range?`;
      }

      return {
        success: true,
        message: message,
        availableSlots: result.availableSlots
      };
    } catch (error) {
      console.error('find_available_meeting_slots error:', error);
      return {
        success: false,
        message: 'I encountered an error finding available slots.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  get_upcoming_meetings: async (args: {
    maxResults?: number;
    timeMin?: string;
  }) => {
    try {
      const params = new URLSearchParams({
        action: 'upcoming-events',
        maxResults: String(args.maxResults || 10)
      });

      if (args.timeMin) {
        params.append('timeMin', args.timeMin);
      }

      const response = await fetch(`/api/google-meet?${params}`);
      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: `I'm having trouble retrieving upcoming meetings: ${result.error}`,
          error: result.error
        };
      }

      if (!result.events || result.events.length === 0) {
        return {
          success: true,
          message: 'Lewis has no upcoming meetings scheduled at the moment. His calendar is clear!',
          events: []
        };
      }

      let message = `📅 Lewis has ${result.events.length} upcoming meeting${result.events.length > 1 ? 's' : ''}:\n\n`;

      result.events.forEach((event: any, index: number) => {
        const start = event.start?.dateTime || event.start?.date;
        const startDate = new Date(start).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
        
        message += `${index + 1}. ${event.summary || 'Untitled Event'}\n`;
        message += `   📍 ${startDate}\n`;
        
        if (event.conferenceData?.entryPoints?.[0]?.uri) {
          message += `   🔗 Video: ${event.conferenceData.entryPoints[0].uri.slice(0, 50)}...\n`;
        }
        
        message += `\n`;
      });

      message += `\nWould you like to schedule a meeting around these commitments?`;

      return {
        success: true,
        message: message,
        events: result.events
      };
    } catch (error) {
      console.error('get_upcoming_meetings error:', error);
      return {
        success: false,
        message: 'I encountered an error retrieving upcoming meetings.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};