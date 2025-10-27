# Chat Functionality Documentation

## Overview
This document provides comprehensive documentation of the chat functionality in the Lewis Perez Portfolio application, including architecture, libraries, function flow, and implementation details.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Libraries & Technologies](#libraries--technologies)
3. [Core Components](#core-components)
4. [Function Call Flow](#function-call-flow)
5. [Tool Calling System](#tool-calling-system)
6. [RAG (Retrieval-Augmented Generation)](#rag-retrieval-augmented-generation)
7. [Error Handling & Fallbacks](#error-handling--fallbacks)

---

## Architecture Overview

The chat system uses a **multi-step tool-calling architecture** where:
1. User sends a question
2. LLM decides whether to use tools (search professional data) or respond directly
3. Tools execute and return structured data from the database
4. LLM synthesizes the tool results into a natural language response
5. Response is logged to database with metadata

### Key Design Principles
- **Tool-First Approach**: LLM calls tools to get accurate information instead of guessing
- **RAG-Only Responses**: System only uses information retrieved from vector database
- **No Hallucination**: Strict rules prevent LLM from inventing details
- **Token Optimization**: Minimal system prompt to reduce costs

---

## Libraries & Technologies

### 1. Vercel AI SDK (v5)
**Purpose**: Core AI orchestration framework  
**Documentation**: https://ai-sdk.dev/docs/ai-sdk-core

**Key Features Used**:
- `generateText`: Synchronous text generation with tool calling
- `tool()`: Helper function for creating type-safe tools
- `stepCountIs()`: Controls multi-step execution (max 5 steps)

**Example Usage**:
```typescript
import { generateText, tool, stepCountIs } from "ai"

const result = await generateText({
  model: "openai/gpt-4o",
  messages: [...],
  tools: {
    search_professional_content: tool({
      description: "Search Lewis's professional content",
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }) => { /* ... */ }
    })
  },
  stopWhen: stepCountIs(5) // Max 5 tool-calling steps
})
```

**Multi-Step Tool Calling**:
- **Step 1**: LLM receives user question → decides to call `search_professional_content`
- **Step 2**: Tool executes → returns search results
- **Step 3**: LLM receives results → synthesizes natural language response
- Steps continue until LLM responds with text (no more tool calls) or hits step limit

### 2. Zod
**Purpose**: Schema validation and type inference  
**Documentation**: https://zod.dev/

**Usage**:
- Defines tool input schemas that LLM must follow
- Validates tool arguments before execution
- Provides TypeScript type inference

```typescript
const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.date().optional(),
  sources: z.array(...)
})

export type Message = z.infer<typeof MessageSchema>
```

### 3. Vector Search (Internal)
**Purpose**: Semantic search over professional content  
**Location**: `@/lib/vector-search`

**Key Functions**:
- `searchVectors()`: Performs similarity search on embedded content
- `getAIChatContext()`: Retrieves relevant context for a query
- Returns `SearchResult[]` with content, metadata, and relevance scores

### 4. OpenAI API (via Vercel AI Gateway)
**Purpose**: LLM provider for text generation  
**Configuration**: Via `process.env.AI_GATEWAY_API_KEY`

**Models Supported**:
- Default: `openai/gpt-4o`
- Configurable via `process.env.AI_MODEL`
- Can use any model available through Vercel AI Gateway

---

## Core Components

### 1. `generateAIResponse()` - Main Entry Point
**Location**: `app/actions/chat.ts`  
**Purpose**: Main function that orchestrates the entire chat flow

**Parameters**:
```typescript
generateAIResponse(
  userMessage: string,           // User's question
  conversationHistory: Message[], // Previous messages
  sessionId?: string,            // Session tracking ID
  options?: AIResponseOptions    // Optional configurations
)
```

**Flow**:
1. Check if AI Gateway API key exists
2. If no API key → fallback to RAG-first approach (legacy)
3. If API key exists → use tool-calling approach
4. Create AI SDK tools from tool handlers
5. Build messages (system prompt + conversation history)
6. Call `generateText()` with tools
7. Extract sources from tool results
8. Log conversation to database
9. Return response with metadata

**Return Value**:
```typescript
{
  response: string,              // LLM's final text response
  sources: Array<{               // Documents used for answer
    id: string,
    title: string,
    type: string,
    relevanceScore: number
  }>,
  metadata: {
    model: string,               // Model used
    sessionId: string,
    toolCallsCount: number,      // How many tools called
    toolsUsed: string[]          // Which tools were used
  }
}
```

### 2. `createAiSdkTools()` - Tool Definitions
**Purpose**: Converts tool handlers into Vercel AI SDK tool format

**Available Tools**:

#### a) `search_professional_content`
- **Critical Primary Tool**: Used for ANY question about Lewis's background
- Searches: experience, skills, projects, achievements, education
- Input: `{ query: string }`
- Returns: Formatted search results with relevance scores

#### b) `get_detailed_experience`
- Get work experience at specific companies
- Input: `{ company?: string }`
- Returns: Experience details with achievements and technologies

#### c) `get_technical_skills`
- Get skills organized by category
- Input: `{ category?: string }`
- Returns: Skills with proficiency levels

#### d) `get_conversation_context`
- Get RAG context for follow-up questions
- Input: `{ topic: string }`
- Returns: Contextual information from vector database

### 3. `buildMessages()` - System Prompt Construction
**Purpose**: Builds the messages array for LLM

**Components**:
1. **System Prompt**: Instructions on how to behave
2. **Conversation Summary**: Summary of older messages (if history > limit)
3. **Recent Messages**: Recent conversation history
4. **User Message**: Current question

**System Prompt** (Optimized for Tokens):
```
You are Lewis Perez, a Senior Software Engineer.

CRITICAL RULES:
1. ALWAYS use search_professional_content tool for ANY question about background
2. NEVER invent or assume details - only use information from tool results
3. If tools return no results, say "I don't have specific information"
4. ONLY respond without tools for greetings like "hi" or "hello"

AVAILABLE TOOLS:
- search_professional_content: Primary tool - use for all background questions
- get_detailed_experience: Specific company details
- get_technical_skills: Skills by category
- get_conversation_context: Follow-up questions
```

**Token Optimization**:
- Reduced from ~400 tokens to ~100 tokens
- Removed verbose guidelines and experience details
- Forces LLM to use tools instead of guessing

### 4. `extractSourcesFromToolResults()` - Source Extraction
**Purpose**: Collects all sources from tool results across all steps

**Process**:
1. Iterate through all steps in result
2. Find tool results from `search_professional_content` or `get_conversation_context`
3. Extract `sources` array from results
4. Combine into single array

### 5. Tool Handlers (in `lib/realtime-tools.ts`)
**Purpose**: Actual implementation of tool execution

**Example - `search_professional_content`**:
```typescript
search_professional_content: async (args: { query: string }) => {
  const results = await searchProfessionalContent(args.query)
  
  const formattedResults = results.results.map((r, index) => {
    const type = r.metadata?.chunk_type || 'general'
    const relevance = Math.round(r.score * 100)
    return `[${type.toUpperCase()} - ${relevance}% relevant]\n${r.content}`
  }).join('\n\n---\n\n')
  
  return {
    success: true,
    content: formattedResults,
    summary: `Retrieved ${results.totalResults} items about ${args.query}`,
    totalResults: results.totalResults,
    sources: results.results
  }
}
```

---

## Function Call Flow

### User Question → Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ASKS QUESTION                           │
│                "What's your experience with React?"                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    generateAIResponse() Called                       │
│  - userMessage: "What's your experience with React?"                 │
│  - conversationHistory: [previous messages]                          │
│  - sessionId: "abc123"                                              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Check AI_GATEWAY_API_KEY Environment Variable           │
└────────────┬───────────────────────────────────────┬────────────────┘
             │                                       │
             │ EXISTS                                │ NOT SET
             ▼                                       ▼
┌─────────────────────────┐           ┌─────────────────────────────┐
│  TOOL-CALLING PATH      │           │  LEGACY RAG-FIRST PATH      │
│  (Modern Approach)      │           │  (Fallback)                 │
└────────┬────────────────┘           └────────┬────────────────────┘
         │                                     │
         ▼                                     ▼
┌──────────────────────────────────┐  ┌──────────────────────────────┐
│  createAiSdkTools()              │  │  getAIChatContext()          │
│  - Creates tool definitions      │  │  - Pre-fetch context         │
│  - Links to toolHandlers         │  │  - Generate mock response    │
└────────┬─────────────────────────┘  └────────┬─────────────────────┘
         │                                     │
         ▼                                     ▼
┌──────────────────────────────────┐  ┌──────────────────────────────┐
│  buildMessages()                 │  │  Return mock response         │
│  - System prompt (100 tokens)    │  │  - Log to database           │
│  - Conversation history          │  └──────────────────────────────┘
│  - User message                  │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     VERCEL AI SDK: generateText()                    │
│  model: "openai/gpt-4o"                                             │
│  messages: [system, ...history, user]                               │
│  tools: { search_professional_content, get_detailed_experience, ... }│
│  stopWhen: stepCountIs(5)                                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
         ┌───────────────────────────────────────────────┐
         │            LLM DECISION PROCESS               │
         │  "User asked about React experience"          │
         │  "I need to search professional content"      │
         └───────────────┬───────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           STEP 1: TOOL CALL                          │
│  LLM generates tool call:                                           │
│  {                                                                  │
│    toolName: "search_professional_content",                        │
│    input: { query: "React experience" }                            │
│  }                                                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TOOL EXECUTION (Automatic)                        │
│  toolHandlers.search_professional_content()                         │
│    ↓                                                                │
│  searchProfessionalContent("React experience")                      │
│    ↓                                                                │
│  searchVectors("React experience", { topK: 10, minScore: 0.6 })    │
│    ↓                                                                │
│  Returns: [                                                         │
│    {                                                                │
│      content: "Built e-commerce platform with React/Next.js...",   │
│      metadata: { chunk_type: "projects" },                         │
│      score: 0.89                                                   │
│    },                                                               │
│    {                                                                │
│      content: "Full Stack Developer using React, TypeScript...",   │
│      metadata: { chunk_type: "experience" },                       │
│      score: 0.85                                                   │
│    }                                                                │
│  ]                                                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TOOL RESULT FORMATTING                          │
│  Format results for LLM consumption:                                │
│  "[PROJECTS - 89% relevant]                                         │
│   Built e-commerce platform with React/Next.js..."                  │
│                                                                     │
│  "[EXPERIENCE - 85% relevant]                                       │
│   Full Stack Developer using React, TypeScript..."                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        STEP 2: LLM SYNTHESIS                         │
│  LLM receives tool results and generates response:                  │
│  "I have extensive experience with React! I'm currently working     │
│   as a Full Stack Developer where I use React and Next.js. I've     │
│   built an e-commerce platform using React with TypeScript..."      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    extractSourcesFromToolResults()                   │
│  Extracts sources from all steps:                                   │
│  - Step 1 tool results: 2 sources                                   │
│  Total sources: 2                                                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BUILD RESPONSE OBJECT                        │
│  {                                                                  │
│    response: "I have extensive experience with React!...",          │
│    sources: [                                                       │
│      { id: "1", title: "Projects", relevanceScore: 0.89 },         │
│      { id: "2", title: "Experience", relevanceScore: 0.85 }        │
│    ],                                                               │
│    metadata: {                                                      │
│      model: "openai/gpt-4o",                                       │
│      sessionId: "abc123",                                          │
│      toolCallsCount: 1,                                            │
│      toolsUsed: ["search_professional_content"]                    │
│    }                                                                │
│  }                                                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       logConversation() to Database                  │
│  - userMessage: "What's your experience with React?"                │
│  - aiResponse: "I have extensive experience..."                    │
│  - status: "answered"                                               │
│  - responseTime: 1250ms                                             │
│  - sessionId: "abc123"                                              │
│  - modelUsed: "openai/gpt-4o"                                       │
│  - vectorSources: [2 sources with metadata]                         │
│  - contextUsed: "search_professional_content"                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RETURN RESPONSE TO CLIENT                       │
│  Response sent to UI for display                                    │
│  - Main text shown to user                                          │
│  - Sources displayed as references                                  │
│  - Metadata used for analytics                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tool Calling System

### How Tool Calling Works

**Multi-Step Execution** (via `stopWhen: stepCountIs(5)`):

1. **Step 1 - Initial Request**:
   - LLM receives user question + system prompt
   - Decides whether to call a tool or respond directly
   - If tool needed: generates tool call with arguments

2. **Step 2 - Tool Execution**:
   - AI SDK automatically executes the tool
   - Tool returns structured data
   - Result is formatted and added to conversation

3. **Step 3 - LLM Response**:
   - LLM receives tool results
   - Synthesizes information into natural language
   - Can call additional tools if needed

4. **Steps 4-5 - Additional Tools** (if needed):
   - LLM can make follow-up tool calls
   - Each step builds on previous results
   - Stops when LLM generates text response or hits step limit

### Tool Execution Flow

```
User: "What projects have you built?"
  ↓
LLM Decision: "Need to search projects"
  ↓
Tool Call: search_professional_content({ query: "projects" })
  ↓
Tool Handler Executes:
  searchProfessionalContent("projects")
    ↓ calls
  searchVectors("projects", { topK: 10, minScore: 0.6 })
    ↓ returns
  [
    { content: "E-commerce platform with Next.js...", score: 0.91 },
    { content: "Shopify integration project...", score: 0.87 }
  ]
  ↓
Tool Result:
  {
    success: true,
    content: "[PROJECTS - 91% relevant]\nE-commerce platform...\n\n[PROJECTS - 87% relevant]\nShopify integration...",
    totalResults: 2,
    sources: [...]
  }
  ↓
LLM Synthesis:
  "I've built several projects! My main portfolio project is an e-commerce platform using Next.js with Shopify integration..."
  ↓
Final Response Returned
```

### When Tools Are Called vs. Direct Response

**Direct Response** (No Tool Call):
- Simple greetings: "hi", "hello", "how are you"
- General conversation not requiring professional data
- **Token savings**: No tool execution overhead

**Tool Call Required**:
- ANY question about professional background
- Questions about: experience, skills, projects, education, achievements
- Follow-up questions needing context
- **Accuracy guarantee**: Real data from database, no hallucination

---

## RAG (Retrieval-Augmented Generation)

### RAG Architecture

**RAG Flow**:
```
User Query
  ↓
Vector Embedding (convert to numerical representation)
  ↓
Similarity Search (find relevant content in vector database)
  ↓
Retrieve Top K Results (default: 10 results with score > 0.6)
  ↓
Format Results (include metadata and relevance scores)
  ↓
LLM Synthesis (convert data to natural language)
```

### Vector Search Implementation

**Function**: `searchVectors(query, options)`

**Parameters**:
```typescript
{
  query: string,              // Search query
  topK: number,              // Max results (default: 10)
  minSimilarityScore: number, // Minimum score (default: 0.6)
  includeMetadata: boolean    // Include metadata (default: true)
}
```

**Return Value**:
```typescript
SearchResult[] = [
  {
    id: string,           // Document ID
    content: string,      // Actual text content
    score: number,        // Similarity score (0-1)
    metadata: {
      chunk_type: string, // "experience" | "projects" | "skills" | "education"
      title: string,      // Document title
      company: string,    // For experience chunks
      // ... other metadata
    }
  }
]
```

### Content Chunking Strategy

Professional content is split into semantic chunks:
- **Experience Chunks**: One per job position (company, role, duration, achievements)
- **Project Chunks**: One per project (description, technologies, impact)
- **Skills Chunks**: Grouped by category (languages, frameworks, tools)
- **Education Chunks**: One per educational institution

**Benefits**:
- Precise retrieval of relevant sections
- Better relevance scoring
- Reduced token usage (only relevant chunks sent to LLM)

---

## Error Handling & Fallbacks

### Error Handling Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    PRIMARY: Tool Calling                     │
│  ✓ AI Gateway API Key exists                                │
│  ✓ Vercel AI SDK with tools                                 │
│  ✓ Logs: "answered" status                                  │
└────────────────────────┬────────────────────────────────────┘
                         │ FAILS (AI error)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FALLBACK 1: RAG-First Approach                  │
│  ✓ Pre-fetch context with getAIChatContext()               │
│  ✓ Generate mock response                                   │
│  ✓ Logs: "failed" status                                    │
└────────────────────────┬────────────────────────────────────┘
                         │ FAILS (context error)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         FALLBACK 2: Hardcoded Context + Mock Response       │
│  ✓ Uses static summary of experience                        │
│  ✓ Pattern matching on user question                        │
│  ✓ Logs: "failed" status                                    │
└────────────────────────┬────────────────────────────────────┘
                         │ FAILS (all else fails)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FALLBACK 3: Generic Error Response              │
│  ✓ Returns generic professional summary                     │
│  ✓ Logs: "error-fallback" status                            │
└─────────────────────────────────────────────────────────────┘
```

### Error Types & Handling

**1. AI SDK Errors**:
- `NoSuchToolError`: LLM tries to call non-existent tool
- `InvalidToolInputError`: Tool arguments don't match schema
- `ToolCallRepairError`: Error during tool call repair

**Handling**: Logged to console, fallback to mock response

**2. Vector Search Errors**:
- Database connection failures
- Embedding generation errors
- No results found

**Handling**: Return empty results, LLM responds "I don't have information"

**3. Tool Execution Errors**:
- Database query failures
- API rate limits
- Timeout errors

**Handling**: Tool returns `{ success: false, error: "message" }`

### Logging & Analytics

All conversations are logged to database with:
```typescript
{
  userMessage: string,        // User's question
  aiResponse: string,         // LLM's response
  status: "answered" | "failed" | "error",
  responseTime: number,       // Milliseconds
  sessionId: string,          // Session tracking
  modelUsed: string,          // Which model generated response
  vectorSources: Array<{      // Sources used
    id, title, type, score
  }>,
  contextUsed: string         // Tools called or context type
}
```

**Analytics Use Cases**:
- Track which topics users ask about
- Measure response quality
- Monitor tool usage patterns
- Identify failed queries for improvement
- Calculate average response times

---

## Configuration

### Environment Variables

```bash
# Required for tool calling
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key

# Model selection (default: openai/gpt-4o)
AI_MODEL=openai/gpt-4o

# Conversation history limit (default: 6 messages)
CONVERSATION_LIMIT=6

# Enable conversation summarization (default: false)
ENABLE_CONVERSATION_SUMMARY=true
```

### Performance Tuning

**Token Usage Optimization**:
- System prompt: ~100 tokens (reduced from ~400)
- Conversation limit: 6 messages (configurable)
- Tool results: Auto-formatted to be concise

**Response Time Optimization**:
- `temperature: 0.7`: Balance between creativity and consistency
- `stopWhen: stepCountIs(5)`: Prevent infinite loops
- Vector search: `topK: 10` limits result size

**Cost Optimization**:
- Tool calling reduces token usage (no pre-fetched context)
- LLM only uses tools when needed
- Conversation summarization for long chats

---

## Best Practices

### For Developers

1. **Always use tools for accuracy**: Never hardcode professional information in prompts
2. **Test with various queries**: Ensure tools handle edge cases
3. **Monitor logs**: Check conversation logs for failed queries
4. **Validate schemas**: Ensure Zod schemas match tool inputs
5. **Handle errors gracefully**: Provide helpful fallback responses

### For Prompt Engineering

1. **Keep system prompt minimal**: Saves tokens on every request
2. **Clear tool descriptions**: Help LLM choose correct tool
3. **Explicit instructions**: "ALWAYS use tool", "NEVER invent details"
4. **Examples in descriptions**: Show LLM what to search for

### For Performance

1. **Limit conversation history**: Use `CONVERSATION_LIMIT` env var
2. **Enable summarization**: For long conversations
3. **Cache vector embeddings**: Reuse embeddings when possible
4. **Monitor response times**: Log slow queries for optimization

---

## Future Improvements

1. **Streaming Support**: Use `streamText` instead of `generateText` for real-time UX
2. **Tool Result Caching**: Cache frequently requested tool results
3. **Advanced RAG**: Re-ranking, hybrid search (keyword + semantic)
4. **Multi-modal Tools**: Support for image/document analysis
5. **User Feedback Loop**: Learn from user ratings of responses
6. **Context Compression**: Automatic prompt compression for long conversations

---

## References

- **Vercel AI SDK Docs**: https://ai-sdk.dev/docs/ai-sdk-core
- **Tool Calling Guide**: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- **Generating Text**: https://ai-sdk.dev/docs/ai-sdk-core/generating-text
- **Zod Documentation**: https://zod.dev/
- **RAG Best Practices**: https://ai-sdk.dev/docs/foundations/prompts

---

## Glossary

- **LLM**: Large Language Model (e.g., GPT-4o)
- **RAG**: Retrieval-Augmented Generation (search then generate)
- **Tool Calling**: LLM decides when to call external functions
- **Vector Search**: Semantic similarity search using embeddings
- **Embedding**: Numerical representation of text for similarity comparison
- **System Prompt**: Instructions that define LLM behavior
- **Token**: Unit of text processed by LLM (≈0.75 words)
- **Step**: One iteration in multi-step tool calling
- **Schema**: Structure definition for data validation
- **Hallucination**: LLM inventing information not in training data

---

**Document Version**: 1.0  
**Last Updated**: October 27, 2025  
**Author**: GitHub Copilot  
**Status**: Complete
