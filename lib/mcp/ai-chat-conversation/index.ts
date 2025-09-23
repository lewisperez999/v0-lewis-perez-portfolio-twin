// Main exports for the MCP AI Chat Conversation tool
import aiChatConversationTool from './ai-chat-tool';
export { aiChatConversationTool };
export type { AIChatOutput, MCPTool } from './types';

// Tool registry for MCP discovery
export const mcpTools = {
  ai_chat_conversation: aiChatConversationTool
};

// Get tools list for MCP server
export function getToolsList() {
  return {
    tools: [
      {
        name: aiChatConversationTool.name,
        description: aiChatConversationTool.description,
        inputSchema: aiChatConversationTool.inputSchema
      }
    ]
  };
}

// Execute tool by name
export async function executeTool(name: string, args: any) {
  if (name === 'ai_chat_conversation') {
    return await aiChatConversationTool.handler(args);
  }
  
  throw new Error(`Tool not found: ${name}`);
}