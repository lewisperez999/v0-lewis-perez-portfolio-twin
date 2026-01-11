# Add MCP Tool

Create a new tool for the MCP (Model Context Protocol) server.

## Description

Adds a new tool to the MCP server that AI agents can discover and invoke. Tools provide structured access to data and functionality.

## Instructions

1. Define the tool in `lib/mcp-tools.ts` or create a new module in `lib/mcp/`
2. Create the tool object with name, description, inputSchema, and handler
3. Add to the `mcpTools` export object
4. Tool will auto-register when the server restarts

## Parameters

- `tool_name` - Snake_case identifier for the tool
- `description` - Clear description of what the tool does
- `input_params` - Parameters the tool accepts
- `return_type` - What the tool returns

## Template

```typescript
// In lib/mcp-tools.ts or lib/mcp/[module]/index.ts

export const my_new_tool = {
  name: 'my_new_tool',
  description: 'Clear description of what this tool does and when to use it',
  inputSchema: {
    type: 'object',
    properties: {
      required_param: {
        type: 'string',
        description: 'Description of this parameter'
      },
      optional_param: {
        type: 'number',
        default: 10,
        description: 'Optional parameter with default'
      },
      enum_param: {
        type: 'string',
        enum: ['option1', 'option2', 'option3'],
        description: 'Parameter with fixed options'
      }
    },
    required: ['required_param']
  },
  handler: async ({ required_param, optional_param = 10, enum_param }: {
    required_param: string;
    optional_param?: number;
    enum_param?: string;
  }) => {
    try {
      // Implementation logic
      const result = await someOperation(required_param);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully processed: ${result}`
          }
        ]
      };
    } catch (error) {
      console.error('Tool error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }
};
```

## Adding to mcpTools

```typescript
// In lib/mcp-tools.ts
export const mcpTools = {
  // ... existing tools
  my_new_tool,
};
```

## Best Practices

1. **Use snake_case** for tool names (MCP convention)
2. **Write clear descriptions** - AI agents use these to decide when to use tools
3. **Validate input** - Even though schema provides validation, check edge cases
4. **Return structured content** - Use the content array format
5. **Handle errors gracefully** - Return error messages, don't throw
6. **Log errors** - Use console.error for debugging
