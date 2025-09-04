# Contact Form Setup with Resend

This document explains how to set up and configure the contact form with Resend email integration.

## Overview

The contact form uses Resend API to send emails when users submit the contact form. The implementation includes:

- Server-side API route for handling form submissions
- Input validation using Zod schemas
- Email templating with HTML and text versions
- Error handling and user feedback
- Fallback functionality when Resend is not configured

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already installed:
- `resend` - Resend SDK for email sending
- `zod` - Runtime type validation

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use their test domain for development
3. Generate an API key from your dashboard
4. Add the API key to your environment variables

### 3. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional (with defaults)
RESEND_FROM_EMAIL=contact@yourdomain.com
RESEND_TO_EMAIL=your-email@gmail.com
```

### 4. Domain Configuration

For production use:

1. **Add your domain** in Resend dashboard
2. **Verify DNS records** according to Resend's instructions
3. **Update FROM_EMAIL** to use your verified domain

For development/testing:
- You can use Resend's test domain
- Emails will be visible in your Resend dashboard but won't be delivered

## API Endpoint

### `/api/contact` - POST

Handles contact form submissions with the following features:

#### Request Body
```typescript
{
  name: string;     // 1-100 characters
  email: string;    // Valid email format
  message: string;  // 10-1000 characters
}
```

#### Response Format
```typescript
// Success
{
  success: true;
  message: string;
  emailId?: string;    // Resend email ID
  fallback?: boolean;  // True if using fallback mode
}

// Error
{
  success: false;
  message: string;
  errors?: Array<{     // Validation errors
    field: string;
    message: string;
  }>;
}
```

#### Features

1. **Input Validation**: Zod schemas validate all inputs
2. **HTML Email Templates**: Rich HTML emails with styling
3. **Plain Text Fallback**: Text version for all email clients
4. **Reply-To Header**: Set to sender's email for easy replies
5. **Error Handling**: Comprehensive error messages
6. **Fallback Mode**: Works without Resend for development

## Email Template

The email includes:

- **Subject**: "New Contact Form Message from {name}"
- **From**: Your configured email address
- **To**: Your configured recipient email
- **Reply-To**: Sender's email address
- **Content**: 
  - Sender's contact information
  - Message content with preserved formatting
  - Timestamp and source information

### HTML Template Features

- Responsive design
- Clean, professional styling
- Clear sections for contact info and message
- Metadata footer with timestamp

## Contact Form Component

### Features

- **Real-time validation** with browser built-ins
- **Loading states** with spinner and disabled inputs
- **Toast notifications** with Sonner for success/error feedback
- **Form reset** on successful submission
- **Accessibility** with proper labels and ARIA attributes

### Toast Notifications

The contact form uses Sonner toast notifications to provide user feedback:

#### **Loading Toast**
- Appears immediately when form is submitted
- Shows "Sending your message..." with description
- Automatically dismissed when request completes

#### **Success Toast**
- Green toast with checkmark icon
- "Message sent successfully!" title
- Descriptive message about response time
- 5-second duration

#### **Error Toast**
- Red toast with error icon
- Specific error title based on failure type
- Helpful description with next steps
- 5-second duration

### States

1. **Default**: Ready for input
2. **Submitting**: Shows loading spinner, disables form, displays loading toast
3. **Success**: Green success toast, form cleared
4. **Error**: Red error toast, form preserved for retry

## Testing

### Development Testing

1. **Without Resend**: Form will log to console and show success message
2. **With Resend**: Emails appear in your Resend dashboard

### Production Testing

1. Fill out the contact form on your live site
2. Check the recipient email inbox
3. Verify email formatting and reply-to functionality
4. Test error cases (invalid email, empty fields)

## Error Handling

The implementation handles various error scenarios:

1. **Validation Errors**: Invalid input data
2. **Network Errors**: Connection issues
3. **Resend API Errors**: Service unavailable, rate limits
4. **Configuration Errors**: Missing API keys or setup issues

Each error type provides appropriate user feedback while logging technical details for debugging.

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent spam
2. **CAPTCHA**: For production, consider adding CAPTCHA protection
3. **Input Sanitization**: All inputs are validated and sanitized
4. **Environment Variables**: Keep API keys secure and out of version control

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check API key is correct
   - Verify domain configuration
   - Check Resend dashboard for delivery status

2. **Validation errors**:
   - Ensure input meets requirements
   - Check browser console for detailed errors

3. **Form not submitting**:
   - Check network connection
   - Verify API endpoint is accessible
   - Check browser console for JavaScript errors

### Debug Mode

To enable debug logging, add to your environment:

```bash
DEBUG=contact:*
```

This will log detailed information about:
- Form submissions
- Email sending attempts
- Error conditions
- Fallback mode activation

## Future Enhancements

Potential improvements:

1. **Auto-reply emails** to acknowledge receipt
2. **Email templates** for different types of inquiries
3. **Database logging** of all contact form submissions
4. **Admin dashboard** to view and manage inquiries
5. **Integration** with CRM systems
6. **File attachments** support
7. **Real-time notifications** via webhooks

## Support

For issues with:
- **Resend API**: Check [Resend documentation](https://resend.com/docs)
- **Form implementation**: Review the code comments and error messages
- **Email delivery**: Check Resend dashboard and logs