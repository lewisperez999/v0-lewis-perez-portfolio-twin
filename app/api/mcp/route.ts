import { NextRequest, NextResponse } from 'next/server';
import { getToolsList, executeTool, mcpTools } from '@/lib/mcp-tools';

// Handle MCP protocol requests - Main endpoint for mcp-remote
export async function POST(request: NextRequest) {
  try {
    // Get the request body (MCP JSON-RPC format)
    const body = await request.json();
    const { jsonrpc, method, params: methodParams, id } = body;

    console.log('MCP Request:', { method, params: methodParams, id });

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
        return new NextResponse(null, { status: 204 });

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

      default:
        return NextResponse.json(
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

    return NextResponse.json(
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
    
    return NextResponse.json(
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

export async function GET(request: NextRequest) {
  // Return server info for GET requests
  return NextResponse.json(
    {
      name: 'lewis-perez-portfolio-twin',
      version: '1.0.0',
      description: 'Professional digital twin MCP server for Lewis Perez portfolio',
      capabilities: ['tools'],
      tools: Object.keys(mcpTools),
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, mcp-session-id',
    },
  });
}