import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
})

// Initialize Resend only if API key is available
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate input
    const validatedData = contactSchema.parse(body)
    
    // Check if Resend is configured
    const resend = getResendClient()
    if (!resend) {
      // Resend API key not configured, logging contact form submission locally
      
      return NextResponse.json({
        success: true,
        message: 'Thank you for your message! I will get back to you soon.',
        fallback: true
      })
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'contact@lewisperez.dev',
      to: process.env.RESEND_TO_EMAIL || 'lewisperez12152017@gmail.com',
      subject: `New Contact Form Message from ${validatedData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${validatedData.name}</p>
            <p><strong>Email:</strong> ${validatedData.email}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${validatedData.message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              This message was sent from your portfolio contact form at ${new Date().toLocaleString()}.
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${validatedData.name}
Email: ${validatedData.email}

Message:
${validatedData.message}

Sent at: ${new Date().toLocaleString()}
      `,
      // Reply-to the sender's email
      replyTo: validatedData.email,
    })

    // Log the response for debugging
    // Email sent successfully

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.',
      emailId: emailResponse.data?.id
    })

  } catch (error) {
    console.error('Contact form error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please check your form data',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    // Handle Resend API errors
    if (error && typeof error === 'object' && 'message' in error) {
      console.error('Resend API error:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send email. Please try again or contact me directly.'
        },
        { status: 500 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}