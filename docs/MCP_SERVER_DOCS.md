# MCP Server Implementation

## Overview

This MCP (Model Context Protocol) server provides Claude Desktop with access to Lewis Perez's professional portfolio data. It implements a simplified JSON-RPC interface that allows AI assistants to search and query professional content, projects, skills, and experience.

## Architecture

### Server Implementation
- **Location**: `app/mcp/server.ts`
- **Type**: Custom tool registry system
- **Protocol**: JSON-RPC 2.0 compatible
- **Database**: PostgreSQL integration via existing `lib/database.ts`

### API Endpoint
- **Location**: `app/api/mcp/route.ts` (main), `app/api/mcp/[transport]/route.ts` (transport-specific)
- **URL**: `http://localhost:3000/api/mcp` (recommended for mcp-remote)
- **Alternative URL**: `http://localhost:3000/api/mcp/http` (for direct HTTP calls)
- **Methods**: POST (JSON-RPC), GET (server info), OPTIONS (CORS)

## Available Tools

### 1. search_professional_content
Search through all professional content using semantic vector search.

**Parameters:**
- `query` (string, required): Search query
- `limit` (number, optional): Max results (default: 10)

**Example:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_professional_content",
    "arguments": {
      "query": "React development",
      "limit": 5
    }
  },
  "id": 1
}
```

### 2. query_projects
Query and filter projects by technology, type, or other criteria.

**Parameters:**
- `technology` (string, optional): Filter by technology
- `type` (string, optional): Filter by project type
- `status` (string, optional): Filter by status
- `limit` (number, optional): Max results (default: 10)

### 3. lookup_skills
Retrieve skills and competencies with filtering options.

**Parameters:**
- `category` (string, optional): Filter by skill category
- `level` (string, optional): Filter by proficiency level
- `limit` (number, optional): Max results (default: 20)

### 4. get_experience_history
Retrieve detailed work experience and career history.

**Parameters:**
- `company` (string, optional): Filter by company
- `role` (string, optional): Filter by role
- `limit` (number, optional): Max results (default: 10)

### 5. get_contact_info
Retrieve contact information and professional links.

**Parameters:** None

### 6. get_available_tools
List all available tools with descriptions.

**Parameters:** None

## Testing

### Manual Testing with PowerShell

1. **Initialize the server:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mcp/http" -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

2. **List available tools:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mcp/http" -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":2}'
```

3. **Test a tool call:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mcp/http" -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_contact_info","arguments":{}},"id":3}'
```

4. **Get server info:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mcp/http" -Method GET
```

### Test Script
Run the automated test script:
```bash
node scripts/test-mcp-server.js
```

### Claude Desktop Testing Prompts

Once connected to Claude Desktop, use these sample prompts to test functionality:

#### Basic Functionality Tests
```
What tools do you have available? Can you list all the professional tools you can access?
```

```
Can you get Lewis Perez's contact information and professional details?
```

#### Professional Content Queries
```
Search for information about Lewis's software development experience and skills.
```

```
What experience does Lewis have with Java, Spring, and database technologies?
```

```
Can you find information about Lewis's projects involving ElasticSearch or data migration?
```

#### Specific Tool Tests
```
What are Lewis's technical skills? Can you categorize them by type or proficiency level?
```

```
Tell me about Lewis's work experience and career progression. What roles has he held?
```

```
Show me Lewis's portfolio projects. What technologies has he worked with?
```

#### Advanced Queries
```
Give me a complete professional overview of Lewis Perez - his background, skills, experience, and notable projects.
```

```
What databases and backend technologies is Lewis experienced with? Include specific projects or examples.
```

```
Can you find examples of complex technical challenges Lewis has solved, particularly around performance optimization or data processing?
```

#### Integration Testing
```
I'm looking to hire a Java developer. Can you search Lewis's profile for Java experience, related projects, and his contact information?
```

```
What experience does Lewis have with performance optimization and monitoring systems?
```

```
I need someone experienced with large-scale data migration. Does Lewis have relevant experience? Show me examples and his contact details.
```

#### Creative Prompts
```
Act as a technical recruiter. Evaluate Lewis Perez's profile for a Senior Backend Developer role requiring Java, Spring, and database expertise.
```

```
What makes Lewis unique as a developer? What are his strongest technical areas based on his portfolio?
```

#### Troubleshooting Prompts
If tools aren't working:
```
Are you able to access any external tools? Can you see the lewis-perez-portfolio-twin server?
```

If data seems incomplete:
```
Can you try searching for "software" or "development" in Lewis's professional content?
```

**Expected Results:**
- ✅ Claude should access and use MCP tools automatically
- ✅ Retrieve real data from your portfolio database  
- ✅ Combine information from multiple tools
- ✅ Provide detailed, accurate responses based on professional data

## Claude Desktop Integration

### Configuration Options

You can connect to the MCP server using either approach:

#### Option 1: Using mcp-remote (Recommended)
```json
{
  "mcpServers": {
    "lewis-perez-portfolio-twin": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/api/mcp"
      ],
      "description": "Professional digital twin MCP server for Lewis Perez portfolio"
    }
  }
}
```

#### Option 2: Using curl (Direct HTTP)
```json
{
  "mcpServers": {
    "lewis-perez-portfolio-twin": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "http://localhost:3000/api/mcp/http",
        "-H", "Content-Type: application/json",
        "-d", "@-"
      ],
      "description": "Professional digital twin MCP server for Lewis Perez portfolio"
    }
  }
}
```

#### For Production Deployment
```json
{
  "mcpServers": {
    "lewis-perez-portfolio-twin": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-deployed-app.vercel.app/api/mcp"
      ],
      "description": "Professional digital twin MCP server for Lewis Perez portfolio"
    }
  }
}
```

### Setup Steps
1. Start the Next.js development server: `npm run dev`
2. Add the configuration to Claude Desktop
3. Restart Claude Desktop
4. The server will appear as an available tool

## JSON-RPC Protocol Support

The server implements these MCP protocol methods:

- `initialize`: Server initialization and capability exchange
- `notifications/initialized`: Client initialization complete notification (returns 204 No Content)
- `tools/list`: Get available tools
- `tools/call`: Execute a specific tool
- `ping`: Health check

### Error Handling
Standard JSON-RPC error codes:
- `-32601`: Method not found
- `-32603`: Internal server error
- `-32000`: Invalid request

## Database Integration

The MCP server integrates with the existing portfolio database:
- **Personal Info**: Contact details and basic information
- **Experience**: Work history and roles
- **Projects**: Portfolio projects with technologies
- **Skills**: Technical competencies and levels
- **Content Chunks**: Vector embeddings for semantic search

## Development Notes

### Custom Implementation Choice
We chose a custom JSON-RPC implementation over the official MCP SDK due to:
- Simpler integration with Next.js API routes
- Better control over request/response handling
- Reduced complexity for HTTP transport
- Direct database integration without transport abstraction

### Performance Considerations
- Vector search uses existing `searchVectors` function
- Database queries are optimized with LIMIT clauses
- Tool responses are structured for efficient parsing
- CORS headers support browser-based testing

### Security
- No authentication implemented (development server)
- CORS enabled for testing
- Input validation on tool parameters
- Error messages don't expose sensitive data

## Future Enhancements

1. **Authentication**: Add API key or session-based auth
2. **Caching**: Implement response caching for frequent queries
3. **Rate Limiting**: Add request rate limiting
4. **Monitoring**: Add metrics and logging
5. **WebSocket Support**: Real-time capabilities
6. **Tool Composition**: Allow chaining multiple tools
7. **Streaming Responses**: For large result sets