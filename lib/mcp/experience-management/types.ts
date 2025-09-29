// Shared types for MCP tools in the experience management module

// Simple MCP Tool Output
export interface MCPToolOutput {
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
  handler: (args: any) => Promise<MCPToolOutput>;
}

// Experience data type based on the actual database schema
export interface Experience {
  id?: number;
  professional_id?: number;
  company: string;
  position: string;
  duration?: string | null;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  description?: string | null;
  achievements?: string[] | null;
  technologies?: string[] | null;
  skills_developed?: string[] | null;
  impact?: string | null;
  keywords?: string[] | null;
  created_at?: Date | string;
}