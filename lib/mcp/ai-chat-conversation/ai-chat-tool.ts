import { generateAIResponse } from '@/app/actions/chat';
import type { MCPTool } from './types';

/**
 * Main MCP AI Chat Conversation Tool
 * 
 * This tool wraps the existing generateAIResponse function and provides
 * a simple MCP interface for AI-powered conversations with professional context.
 * 
 */

export type AIChatInput = {
  message: string;
};


export const aiChatConversationTool: MCPTool = {
  name: 'ai_chat_conversation',
  description: 'AI-powered conversation using existing generateAIResponse function',
  inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Search query for professional content' },
      },
      required: ['message'],
    },
  handler: async ({message}: AIChatInput) => {
    try {
      // Call the existing generateAIResponse function with minimal options
      const aiResponse = await generateAIResponse(
        message,
        [],
        undefined,
        {
          responseFormat: 'detailed',
          includeSources: true
        }
      );

      // Simple formatted response
      let responseText = aiResponse.response;
      
      // Add sources if available
      if (aiResponse.sources && aiResponse.sources.length > 0) {
        responseText += '\n\n**Sources:**\n';
        aiResponse.sources.forEach((source, index) => {
          responseText += `${index + 1}. ${source.title || 'Professional Content'}\n`;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: responseText
          }
        ]
      };

  } catch (error) {
    console.error('AI Chat Tool Error:', error);
    
    return {
      content: [
        {
          type: 'text',
          text: `I encountered an error processing your question. Please try asking something about my professional experience, skills, or projects.`
        }
      ]
    };
  }
}
}

// Export the tool for use
export default aiChatConversationTool;