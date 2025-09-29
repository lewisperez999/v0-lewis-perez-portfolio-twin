import { getToolsList, executeTool, mcpTools } from '@/lib/mcp-tools';
import { verifyClerkToken } from '@clerk/mcp-tools/next'
import { withMcpAuth } from '@vercel/mcp-adapter'
import { auth, clerkClient } from '@clerk/nextjs/server'

// Handle MCP protocol requests - Main endpoint for mcp-remote
const handler = async function (request: Request): Promise<Response> {
  try {
    let body: any = {};
    let jsonrpc: string = '2.0';
    let method: string = '';
    let methodParams: any = {};
    let id: any = null;

    // Only parse JSON for POST requests or requests with a body
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        const requestText = await request.text();
        if (requestText.trim()) {
          body = JSON.parse(requestText);
          ({ jsonrpc, method, params: methodParams, id } = body);
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return Response.json(
          {
            jsonrpc: '2.0',
            error: {
              code: -32700,
              message: 'Parse error: Invalid JSON',
            },
            id: null,
          },
          { status: 400 }
        );
      }
    } else if (request.method === 'GET') {
      // For GET requests, we might handle discovery or health checks
      method = 'tools/list'; // Default to listing tools for GET requests
      methodParams = {};
      id = Date.now();
    }

    console.log('MCP Request:', { method: request.method, mcp_method: method, params: methodParams, id });

    // If no method specified, return error
    if (!method) {
      return Response.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request: method required',
          },
          id,
        },
        { status: 400 }
      );
    }

    let result: any;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'lewis-perez-portfolio-twin',
            version: '1.0.0',
            description: 'Professional digital twin MCP server for Lewis Perez portfolio',
          },
        };
        break;

      case 'notifications/initialized':
        // Handle initialized notification - no response needed for notifications
        return new Response(null, { status: 204 });

      case 'tools/list':
        result = getToolsList();
        break;

      case 'tools/call':
        const { name, arguments: toolArgs } = methodParams;
        result = await executeTool(name, toolArgs);
        break;

      case 'ping':
        result = {};
        break;

      case 'options':
        // Handle CORS preflight
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, mcp-session-id',
            'Access-Control-Max-Age': '86400',
          },
        });

      default:
        return Response.json(
          {
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
            id,
          },
          { status: 400 }
        );
    }

    return Response.json(
      {
        jsonrpc: '2.0',
        result,
        id,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, mcp-session-id',
        },
      }
    );
  } catch (error) {
    console.error('MCP request error:', error);
    
    return Response.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
          data: error instanceof Error ? error.message : 'Unknown error',
        },
        id: null,
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

const authHandler = withMcpAuth(
  handler,
  async (_, token) => {
    const clerk = await clerkClient()
    const clerkAuth = await auth({ acceptsToken: 'oauth_token' })
    const authInfo = await verifyClerkToken(clerkAuth, token)
    // Add role to extra
    if (authInfo) {
      if (!authInfo.extra) {
        authInfo.extra = {};
      }
      if (clerkAuth.userId) {
        try {
          const user = await clerk.users.getUser(clerkAuth.userId)
          authInfo.extra.role = user.publicMetadata?.role || 'user'
        } catch (error) {
          console.error('Error fetching user role:', error)
          authInfo.extra.role = 'user' // default
        }
      } else {
        authInfo.extra.role = 'anonymous'
      }
      return authInfo
    }},
  {
    required: true,
    resourceMetadataPath: '/.well-known/oauth-protected-resource/secure/mcp',
  },
)

export { authHandler as GET, authHandler as POST, authHandler as OPTIONS }