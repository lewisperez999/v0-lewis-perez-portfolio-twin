// Main MCP Tools Index
// Exports all available MCP tools for the Lewis Perez Portfolio

// Import individual tool collections
import { aiChatConversationTool } from './ai-chat-conversation';
import { experienceManagementTools } from './experience-management';

// Consolidated tool exports
export const allMCPTools = [
  aiChatConversationTool,
  ...experienceManagementTools
];

// Export individual tools for selective import
export {
  aiChatConversationTool,
  experienceManagementTools
};

// Re-export types (choose one source to avoid conflicts)
export type { MCPTool, MCPToolOutput } from './experience-management/types';

// Default export - all tools
export default allMCPTools;