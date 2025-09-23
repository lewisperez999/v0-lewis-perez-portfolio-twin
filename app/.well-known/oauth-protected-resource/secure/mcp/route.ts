import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandlerClerk,
} from '@clerk/mcp-tools/next'

const handler = protectedResourceHandlerClerk({
  // Specify which OAuth scopes this protected resource supports for MCP
  scopes_supported: ['profile', 'email'],
  // Specify the correct resource URI to match the MCP server endpoint
  resource: 'http://localhost:3000/api/secure/mcp',
})
const corsHandler = metadataCorsOptionsRequestHandler()

export { handler as GET, corsHandler as OPTIONS }