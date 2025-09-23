// Simplified types for the MCP AI Chat Tool

// Simple MCP Tool Output
export interface AIChatOutput {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

// MCP Tool Definition
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<AIChatOutput>;
}