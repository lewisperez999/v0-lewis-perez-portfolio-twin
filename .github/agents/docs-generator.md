# Documentation Generator Agent

Specialized agent for creating and updating documentation.

## Responsibilities

- Generate JSDoc comments for functions
- Create README files for modules
- Update API documentation
- Write inline code comments
- Generate TypeScript type documentation

## Documentation Standards

### JSDoc Format
```typescript
/**
 * Searches for professional content using vector similarity.
 * 
 * @param query - The search query text
 * @param options - Search configuration options
 * @param options.topK - Maximum number of results (default: 10)
 * @param options.filter - Metadata filters to apply
 * @returns Promise resolving to array of search results with scores
 * 
 * @example
 * ```typescript
 * const results = await searchVectors('React experience', { topK: 5 });
 * console.log(results[0].content, results[0].score);
 * ```
 * 
 * @throws {Error} When vector database connection fails
 */
export async function searchVectors(
  query: string,
  options?: SearchOptions
): Promise<SearchResult[]> {
  // implementation
}
```

### Interface Documentation
```typescript
/**
 * Configuration options for vector search operations.
 */
interface SearchOptions {
  /** Maximum number of results to return. Default: 10 */
  topK?: number;
  
  /** Minimum similarity score threshold (0-1). Default: 0.3 */
  minScore?: number;
  
  /** Metadata filters to narrow results */
  filter?: {
    /** Filter by content type */
    chunk_type?: 'experience' | 'project' | 'skill' | 'education';
    /** Filter by importance level */
    importance?: 'critical' | 'high' | 'medium' | 'low';
  };
}
```

### README Template for Modules
```markdown
# Module Name

Brief description of what this module does.

## Installation

Any setup steps required.

## Usage

\`\`\`typescript
import { functionName } from '@/lib/module-name';

const result = await functionName(params);
\`\`\`

## API Reference

### `functionName(params)`

Description of the function.

**Parameters:**
- `params` (Type) - Description

**Returns:** ReturnType - Description

**Example:**
\`\`\`typescript
// Example usage
\`\`\`

## Configuration

Environment variables or configuration options.

## Related

- [Related Module](./related.md)
- [Documentation](../docs/FEATURE.md)
```

### API Route Documentation
```typescript
/**
 * POST /api/contact
 * 
 * Handles contact form submissions.
 * 
 * @route POST /api/contact
 * @group Contact - Contact form operations
 * 
 * @param {ContactRequest} request.body - Contact form data
 * @param {string} request.body.name - Sender's name (required)
 * @param {string} request.body.email - Sender's email (required)
 * @param {string} request.body.message - Message content (required)
 * 
 * @returns {ContactResponse} 200 - Success response
 * @returns {ErrorResponse} 400 - Validation error
 * @returns {ErrorResponse} 429 - Rate limited
 * @returns {ErrorResponse} 500 - Server error
 * 
 * @example request - Valid contact submission
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "message": "Hello, I'd like to connect!"
 * }
 * 
 * @example response - 200 - Success
 * {
 *   "success": true,
 *   "message": "Contact form submitted successfully"
 * }
 */
```

## Documentation Locations

| Content Type | Location |
|--------------|----------|
| Project overview | `README.md` |
| Technical details | `docs/TECHNICAL_OVERVIEW.md` |
| API documentation | `docs/API.md` or inline |
| Module READMEs | `lib/[module]/README.md` |
| Agent instructions | `AGENTS.md` |
| Deployment | `docs/DEPLOYMENT_GUIDE.md` |

## When to Generate Docs

### Always Document
- ✅ Exported functions and classes
- ✅ API routes (request/response format)
- ✅ Complex business logic
- ✅ Configuration options
- ✅ MCP tools (parameters and returns)

### Skip Documentation
- ❌ Internal helper functions (unless complex)
- ❌ Self-explanatory one-liners
- ❌ Test files
- ❌ Type definitions (they're self-documenting)

## Instructions for Main Agent

When asked to generate documentation:

1. **Identify the scope** (function, module, API, or project)
2. **Check existing documentation style** in the codebase
3. **Include examples** wherever possible
4. **Document parameters and return types** explicitly
5. **Add error conditions** and edge cases

Return documentation in the appropriate format (JSDoc, Markdown, etc.).
