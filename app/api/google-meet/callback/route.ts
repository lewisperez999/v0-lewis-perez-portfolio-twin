import { NextRequest, NextResponse } from 'next/server';

/**
 * Google OAuth Callback Handler
 * Redirects to Clerk for OAuth connection
 * This route is no longer needed since Clerk handles OAuth
 */

export async function GET(request: NextRequest) {
  // Redirect to Clerk's account connection page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Google Calendar Connection</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 {
          color: #4CAF50;
          margin-bottom: 20px;
        }
        .info {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 20px;
          border-radius: 4px;
          margin: 30px 0;
          text-align: left;
        }
        .step {
          margin: 15px 0;
          padding-left: 10px;
        }
        button {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }
        button:hover {
          background: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✨ Google Calendar Integration via Clerk</h1>
        
        <p>This portfolio now uses <strong>Clerk</strong> for seamless Google OAuth integration!</p>
        
        <div class="info">
          <h3>📋 How to Connect Your Google Calendar:</h3>
          
          <div class="step">
            <strong>1.</strong> Sign in to your account (if not already signed in)
          </div>
          
          <div class="step">
            <strong>2.</strong> Click your profile picture in the top right
          </div>
          
          <div class="step">
            <strong>3.</strong> Go to "<strong>Manage account</strong>"
          </div>
          
          <div class="step">
            <strong>4.</strong> Navigate to "<strong>Connected accounts</strong>"
          </div>
          
          <div class="step">
            <strong>5.</strong> Click "<strong>Connect</strong>" next to Google
          </div>
          
          <div class="step">
            <strong>6.</strong> Grant Google Calendar permissions
          </div>
        </div>

        <p><strong>✅ Benefits of Clerk OAuth:</strong></p>
        <ul style="text-align: left; display: inline-block;">
          <li>No manual token management</li>
          <li>Automatic token refresh</li>
          <li>Secure token storage</li>
          <li>Easy account management</li>
          <li>One-click connection</li>
        </ul>

        <button onclick="window.location.href='/'">
          Go to Home Page
        </button>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
