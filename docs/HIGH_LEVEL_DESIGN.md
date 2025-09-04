# Lewis Perez AI-Powered Portfolio - High Level Design Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Core Components](#core-components)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Database Architecture](#database-architecture)
8. [AI & Vector Search System](#ai--vector-search-system)
9. [Admin System](#admin-system)
10. [MCP Server Architecture](#mcp-server-architecture)
11. [API Design](#api-design)
12. [Analytics Implementation](#analytics-implementation)
13. [Security Considerations](#security-considerations)
14. [Performance & Scalability](#performance--scalability)
15. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### Purpose
The Lewis Perez Portfolio is an AI-powered professional portfolio website that combines traditional portfolio presentation with intelligent conversational AI capabilities. The system provides visitors with the ability to explore professional experience through both static content and dynamic AI-powered chat interactions.

### Key Features
- **AI-Powered Chat Interface**: Interactive chat assistant with RAG (Retrieval-Augmented Generation)
- **Vector Search Integration**: Semantic search through professional content using Upstash Vector
- **Real-time Streaming Responses**: Powered by Vercel AI SDK with configurable AI models
- **Comprehensive Portfolio**: Experience, skills, projects, and contact information
- **Admin Dashboard**: Complete content management and analytics system
- **Model Context Protocol (MCP) Server**: Structured access to professional data
- **Conversation Analytics**: Chat history management and usage insights
- **Performance Monitoring**: Vercel Analytics and Speed Insights for optimal user experience

### Architecture Philosophy
The system follows a modern **JAMstack architecture** with:
- **Frontend**: Next.js 15 with App Router for optimal performance
- **Backend**: Server Actions and API routes for seamless data flow
- **Database**: PostgreSQL for structured data with vector search integration
- **AI/ML**: Configurable AI models through Vercel AI Gateway
- **Deployment**: Vercel platform for automatic scaling and edge optimization

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Browser)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Portfolio     │  │   AI Chat       │  │   Admin         │             │
│  │   Components    │  │   Interface     │  │   Dashboard     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────────────────────┐
│                        NEXT.JS APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   App Router    │  │   Server        │  │   API Routes    │             │
│  │   (RSC)         │  │   Actions       │  │   (/api)        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   MCP Server    │  │   Vector Search │  │   AI Chat       │             │
│  │   Integration   │  │   Engine        │  │   Engine        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES LAYER                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   PostgreSQL    │  │   Upstash       │  │   Vercel AI     │             │
│  │   Database      │  │   Vector DB     │  │   Gateway       │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   OpenAI/Claude │  │   Vercel        │  │   GitHub        │             │
│  │   AI Models     │  │   Analytics &   │  │   (Source)      │             │
│  │                 │  │   Speed Insights│  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Technologies
- **Next.js 15**: React framework with App Router for modern SSR/SSG
- **React 19**: Latest React features with improved concurrent rendering
- **TypeScript**: Type-safe development with strict configuration
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: High-quality React components built on Radix UI
- **Sonner**: Modern toast notification library for user feedback
- **Geist Font**: Modern typography from Vercel

### Backend Technologies
- **Node.js**: JavaScript runtime for server-side logic
- **Server Actions**: Next.js native server-side functions
- **API Routes**: RESTful API endpoints for external integrations
- **Zod**: Runtime type validation and schema parsing

### Communication & Email
- **Resend**: Modern email API for transactional emails
- **HTML/Text Templates**: Rich email formatting with fallback support

### Database & Storage
- **PostgreSQL**: Primary relational database for structured data
- **Upstash Vector**: Vector database for semantic search capabilities
- **Redis** (via Upstash): Caching layer for performance optimization

### AI & Machine Learning
- **Vercel AI SDK**: Framework for AI integration and streaming
- **Multiple AI Providers**: OpenAI, Anthropic, Meta LLaMA, Google Gemini
- **Vector Embeddings**: OpenAI text-embedding-3-small (1024 dimensions)
- **RAG (Retrieval-Augmented Generation)**: Context-aware AI responses

### Development & Deployment
- **Vercel**: Primary deployment platform with edge optimization
- **GitHub**: Version control and CI/CD integration
- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization

### Analytics & Performance Monitoring
- **Vercel Analytics**: Real-time usage analytics and user behavior insights
- **Vercel Speed Insights**: Core Web Vitals monitoring and performance optimization
- **Custom Analytics**: Conversation tracking and AI interaction metrics

---

## Directory Structure

```
v0-lewis-perez-portfolio-twin/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── chat.ts              # AI chat logic and response generation
│   ├── admin/                   # Admin dashboard
│   │   ├── components/          # Admin-specific UI components
│   │   ├── actions/            # Admin server actions
│   │   ├── content/            # Content management pages
│   │   ├── database/           # Database management tools
│   │   ├── debug/              # Debug and diagnostic tools
│   │   └── embeddings/         # Vector embedding management
│   ├── api/                    # API Routes
│   │   ├── [transport]/        # MCP transport endpoints
│   │   ├── debug/              # Debug API endpoints
│   │   ├── health/             # Health check endpoints
│   │   └── mcp/                # MCP server API
│   ├── mcp/                    # Model Context Protocol server
│   │   └── server.ts           # MCP server implementation
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout component with Analytics & Speed Insights
│   └── page.tsx                # Main portfolio page
├── components/                  # Reusable React components
│   ├── ui/                     # shadcn/ui components
│   ├── about.tsx               # About section component
│   ├── ai-chat.tsx             # AI chat interface
│   ├── contact.tsx             # Contact section
│   ├── experience.tsx          # Experience timeline
│   ├── header.tsx              # Site header/navigation
│   ├── hero.tsx                # Hero section
│   ├── projects.tsx            # Projects showcase
│   ├── skills.tsx              # Skills display
│   └── theme-provider.tsx      # Dark/light theme provider
├── lib/                        # Utility libraries
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Helper functions
│   ├── validations/            # Zod validation schemas
│   ├── database.ts             # Database connection utilities
│   ├── db-init.ts              # Database initialization
│   ├── utils.ts                # General utility functions
│   └── vector-search.ts        # Vector search implementation
├── database/                   # Database schemas and migrations
│   ├── migration-001-schema-alignment.sql
│   ├── schema-actual.sql
│   └── schema.sql              # Main database schema
├── docs/                       # Documentation
│   ├── debugging/              # Debug documentation
│   ├── EMBEDDING_SETUP.md      # Vector embedding setup
│   ├── MCP_ARCHITECTURE_DESIGN.md
│   ├── MCP_SERVER_DOCS.md      # MCP server documentation
│   └── [other documentation files]
├── public/                     # Static assets
│   ├── placeholder-logo.png
│   ├── placeholder-user.jpg
│   └── [other static assets]
├── scripts/                    # Utility scripts
│   └── run-migration.js        # Database migration runner
├── styles/                     # Additional stylesheets
│   └── globals.css
├── package.json                # Dependencies and scripts
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── components.json             # shadcn/ui configuration
```

---

## Core Components

### 1. Portfolio Components (`/components`)

#### **Hero Component** (`hero.tsx`)
- Professional introduction and key messaging
- Dynamic typing animations and visual elements
- Call-to-action buttons for AI chat and contact

#### **Experience Component** (`experience.tsx`)
- Timeline-based display of professional experience
- Company information, roles, and achievements
- Technology tags and duration indicators

#### **Projects Component** (`projects.tsx`)
- Showcase of key projects with descriptions
- Technology stack indicators and links
- GitHub repositories and live demo links

#### **Skills Component** (`skills.tsx`)
- Categorized display of technical and soft skills
- Proficiency levels and experience indicators
- Filterable by skill type and category

#### **AI Chat Component** (`ai-chat.tsx`)
- Interactive chat interface with streaming responses
- Message history and context management
- Source attribution for AI responses
- Suggested questions and input validation

#### **Contact Component** (`contact.tsx`)
- Professional contact form with email integration via Resend API
- Real-time form validation with browser built-ins
- Toast notifications with Sonner for enhanced user feedback
- Loading states with spinner and disabled inputs during submission
- Automatic form reset on successful message delivery
- Accessibility compliance with proper labels and ARIA attributes

**Contact Form Features:**
- **Email Integration**: Powered by Resend API with HTML/text templates
- **Fallback Handling**: Graceful degradation when email service unavailable
- **Toast Notifications**: 
  - Loading toast during submission ("Sending your message...")
  - Success toast with green checkmark (5-second duration)
  - Error toast with specific error details and retry guidance
- **Form States**: Default → Submitting → Success/Error with visual feedback
- **Input Validation**: Required field validation and email format checking
- **Error Recovery**: Form preservation on errors to enable easy retry

### 2. Admin System (`/app/admin`)

#### **Admin Dashboard** (`page.tsx`)
- System health monitoring and metrics
- Conversation analytics and user insights
- Quick access to management tools

#### **Content Management**
- Content chunks editor for vector search optimization
- Experience, skills, and projects management
- Personal information and contact details editor

#### **Database Management**
- Schema information and table statistics
- Database operations and maintenance tools
- Migration management and backup utilities

#### **Analytics & Monitoring**
- Conversation logs and success rates
- Vector search performance metrics
- System health checks and diagnostics

---

## Data Flow Diagrams

### AI Chat Interaction Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│   Input         │───▶│   Vector        │
│   (Question)    │    │   Validation    │    │   Search        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐           ▼
│   AI Response   │◀───│   AI Model      │    ┌─────────────────┐
│   (Streaming)   │    │   Processing    │◀───│   Context       │
└─────────────────┘    └─────────────────┘    │   Retrieval     │
         │                                    └─────────────────┘
         ▼                                             │
┌─────────────────┐    ┌─────────────────┐           ▼
│   Response      │◀───│   Conversation  │    ┌─────────────────┐
│   Display       │    │   Logging       │◀───│   Database      │
└─────────────────┘    └─────────────────┘    │   Storage       │
                                              └─────────────────┘
```

### Admin Content Management Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin User    │───▶│   Authentication│───▶│   Dashboard     │
│   Access        │    │   Check         │    │   Access        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐           ▼
│   Database      │◀───│   CRUD          │    ┌─────────────────┐
│   Updates       │    │   Operations    │◀───│   Content       │
└─────────────────┘    └─────────────────┘    │   Management    │
         │                                    └─────────────────┘
         ▼                                             │
┌─────────────────┐    ┌─────────────────┐           ▼
│   Vector DB     │◀───│   Embedding     │    ┌─────────────────┐
│   Sync          │    │   Generation    │◀───│   Content       │
└─────────────────┘    └─────────────────┘    │   Changes       │
                                              └─────────────────┘
```

### MCP Server Data Access Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MCP Client    │───▶│   Tool Request  │───▶│   Input         │
│   (External)    │    │   Parsing       │    │   Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐           ▼
│   Formatted     │◀───│   Response      │    ┌─────────────────┐
│   Response      │    │   Generation    │◀───│   Database      │
└─────────────────┘    └─────────────────┘    │   Query         │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Vector Search │
                                              │   (Optional)    │
                                              └─────────────────┘
```

---

## Database Architecture

### Schema Overview

The database follows a normalized design optimized for both relational queries and vector search operations.

```sql
-- Core Professional Data Tables
personal_info (UUID PK)          -- Personal and contact information
├── id (UUID)
├── name, title, location
├── email, phone, website
├── linkedin, github, twitter
└── summary, bio, highlights[]

skills (INTEGER PK)              -- Technical and soft skills
├── id (INTEGER)
├── skill_name, category
├── proficiency, experience_years
├── context, projects[]
└── skill_type (technical/soft)

projects (INTEGER PK)            -- Portfolio projects
├── id (INTEGER)
├── name, description
├── technologies[], role
├── repository_url, demo_url
├── outcomes[], challenges[]
└── documentation_url

experiences (INTEGER PK)         -- Work experience
├── id (INTEGER)
├── company, position
├── start_date, end_date
├── description, achievements[]
├── technologies[], skills_developed[]
└── impact, keywords[]

content_chunks (INTEGER PK)      -- Vector search content
├── id (INTEGER)
├── chunk_id (unique), content
├── chunk_type, title
├── metadata (JSONB)
├── importance, search_weight
├── vector_id (Upstash reference)
└── source_file, word_count

-- Analytics and Logging Tables
conversations (UUID PK)          -- Chat conversation logs
├── id (UUID)
├── session_id, user_message
├── ai_response, response_time_ms
├── status, model_used
├── vector_sources (JSONB)
├── context_used
└── user_ip, user_agent

conversation_metrics (UUID PK)   -- Daily analytics
├── id (UUID)
├── date (unique)
├── total_conversations
├── successful_conversations
├── average_response_time_ms
└── unique_users

user_sessions (VARCHAR PK)       -- User session tracking
├── session_id (VARCHAR)
├── user_ip, user_agent
├── first_visit, last_activity
└── conversation_count
```

### Key Database Features

1. **Hybrid Primary Keys**: UUID for user-facing data, INTEGER for internal operations
2. **JSONB Storage**: Flexible metadata storage for content chunks and analytics
3. **Array Support**: PostgreSQL arrays for skills, technologies, achievements
4. **Optimized Indexes**: Strategic indexing for MCP tool queries and vector search
5. **Audit Trails**: Created/updated timestamps with automatic trigger updates

---

## AI & Vector Search System

### Vector Search Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VECTOR SEARCH PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Content   │─▶│  Embedding  │─▶│   Upstash   │─▶│   Search    │    │
│  │   Chunks    │  │  Generation │  │   Vector    │  │   Results   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Query     │─▶│   Vector    │─▶│  Similarity │─▶│  Ranked     │    │
│  │   Input     │  │   Encoding  │  │   Search    │  │   Results   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### AI Chat System Components

#### **1. Chat Engine** (`/app/actions/chat.ts`)
- **Multi-Model Support**: Configurable AI models through environment variables
- **RAG Integration**: Retrieval-Augmented Generation with vector search
- **Streaming Responses**: Real-time response generation with Vercel AI SDK
- **Fallback Mechanisms**: Mock responses when external services are unavailable

#### **2. Vector Search Engine** (`/lib/vector-search.ts`)
- **Semantic Search**: 1024-dimension embeddings with OpenAI text-embedding-3-small
- **Relevance Filtering**: Configurable similarity score thresholds
- **Content Type Filtering**: Search by experience, skills, projects, education
- **Hybrid Fallbacks**: Database and mock content when vector search fails

#### **3. Context Management**
- **RAG Context Building**: Intelligent content retrieval and ranking
- **Source Attribution**: Tracking and displaying content sources
- **Conversation History**: Maintaining chat context across interactions

### Supported AI Models

The system supports multiple AI providers through Vercel AI Gateway:

| Provider | Models | Use Case |
|----------|--------|----------|
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4-turbo | Primary models for general chat |
| **Anthropic** | claude-3.5-sonnet, claude-3-haiku | Advanced reasoning and coding |
| **Meta** | llama-3.1-70b-instruct, llama-3.1-8b-instruct | Open source alternatives |
| **Google** | gemini-1.5-pro | Google's flagship model |
| **Mistral** | mistral-large | European AI alternative |

---

## Admin System

### Admin Architecture Overview

The admin system provides comprehensive management capabilities for all aspects of the portfolio application.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ADMIN DASHBOARD                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Content       │  │   Database      │  │   Analytics     │         │
│  │   Management    │  │   Operations    │  │   & Monitoring  │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│           │                     │                     │                │
│           ▼                     ▼                     ▼                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   • Skills      │  │   • Schema      │  │   • Chat Logs   │         │
│  │   • Projects    │  │   • Migrations  │  │   • Success     │         │
│  │   • Experience  │  │   • Backups     │  │     Rates       │         │
│  │   • Personal    │  │   • Health      │  │   • Performance │         │
│  │     Info        │  │     Checks      │  │     Metrics     │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Admin Features

#### **1. Content Management** (`/app/admin/content/`)
- **Skills Management**: Add, edit, delete skills with proficiency levels
- **Projects Management**: Portfolio project CRUD operations
- **Experience Management**: Work history and achievement tracking
- **Personal Info**: Contact details and bio management
- **Content Chunks**: Vector search content optimization

#### **2. Database Management** (`/app/admin/database/`)
- **Schema Information**: Table structure and statistics
- **Health Monitoring**: Connection status and performance metrics
- **Migration Management**: Database version control and updates
- **Backup Operations**: Data export and import functionality

#### **3. Analytics Dashboard** (`/app/admin/`)
- **Conversation Analytics**: Chat success rates and response times
- **User Metrics**: Session tracking and engagement analytics
- **System Health**: Vector search and AI model performance
- **Usage Insights**: Popular queries and interaction patterns

#### **4. Debug Tools** (`/app/admin/debug/`)
- **Vector Search Testing**: Query testing and relevance tuning
- **AI Model Testing**: Response quality and performance evaluation
- **Database Query Testing**: SQL query optimization and debugging
- **System Diagnostics**: End-to-end system health checks

---

## MCP Server Architecture

### Model Context Protocol Overview

The MCP (Model Context Protocol) server provides structured access to professional portfolio data for external AI systems and applications.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MCP SERVER ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Tool          │  │   Database      │  │   Vector        │         │
│  │   Registry      │  │   Queries       │  │   Search        │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│           │                     │                     │                │
│           ▼                     ▼                     ▼                │
│  ┌─────────────────────────────────────────────────────────────────────┤
│  │                    AVAILABLE TOOLS                                  │
│  │                                                                     │
│  │  • search_professional_content    • lookup_skills                  │
│  │  • query_projects                 • get_experience_history         │
│  │  • get_contact_info                                                 │
│  └─────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┤
│  │                     TOOL CAPABILITIES                              │
│  │                                                                     │
│  │  • Semantic search through professional content                    │
│  │  • Filtered queries by content type and importance                 │
│  │  • Skills lookup with proficiency and experience filters           │
│  │  • Project filtering by technology and status                      │
│  │  • Experience history with customizable formatting                 │
│  │  • Contact information with privacy controls                       │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### MCP Tools and Capabilities

#### **1. search_professional_content**
```typescript
// Search through all professional content with semantic matching
{
  query: string,              // Search query
  limit?: number,             // Max results (default: 10)
  category?: 'all' | 'experience' | 'projects' | 'skills' | 'education'
}
```

#### **2. query_projects**
```typescript
// Filter and retrieve project information
{
  technology?: string,        // Filter by tech stack
  status?: 'completed' | 'in-progress' | 'planned' | 'archived',
  featured?: boolean,         // Featured projects only
  limit?: number              // Max results
}
```

#### **3. lookup_skills**
```typescript
// Retrieve skills with advanced filtering
{
  skill_type?: 'technical' | 'soft' | 'language' | 'certification' | 'all',
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all',
  category?: string           // Specific skill category
}
```

#### **4. get_experience_history**
```typescript
// Retrieve work experience with formatting options
{
  include_details?: boolean,  // Include descriptions and achievements
  format?: 'chronological' | 'skills_based' | 'summary',
  years?: number              // Limit to recent years
}
```

#### **5. get_contact_info**
```typescript
// Retrieve contact information with privacy controls
{
  include_social?: boolean,   // Include social media links
  format?: 'standard' | 'business' | 'casual'
}
```

---

## API Design

### Server Actions (`/app/actions/`)

#### **Chat Actions** (`chat.ts`)
```typescript
// AI chat functionality
generateAIResponse(message: string, history: Message[]): Promise<AIResponse>
searchProfessionalContent(query: string): Promise<SearchResults>
getSuggestedQuestions(): Promise<string[]>
validateUserInput(input: string): Promise<ValidationResult>
```

#### **Admin Actions** (`/app/admin/actions/`)
```typescript
// Content management
createSkill(data: SkillData): Promise<Result>
updateProject(id: string, data: ProjectData): Promise<Result>
deleteExperience(id: string): Promise<Result>

// Analytics
getConversationLogs(filters: LogFilters): Promise<ConversationLog[]>
getDashboardStats(): Promise<DashboardMetrics>
getSystemHealth(): Promise<HealthStatus>
```

### API Routes (`/app/api/`)

#### **Contact Form** (`/api/contact`)
```typescript
POST /api/contact
// Handles contact form submissions via Resend API
{
  name: string,
  email: string,
  message: string
}

Response:
{
  success: boolean,
  message: string,
  emailId?: string  // Resend email ID if successful
}
```

#### **Health Check** (`/api/health`)
```typescript
GET /api/health
// Returns system health status
{
  status: "healthy" | "degraded" | "unhealthy",
  database: boolean,
  vectorSearch: boolean,
  aiModels: boolean,
  timestamp: string
}
```

#### **MCP Transport** (`/api/[transport]`)
```typescript
POST /api/sse          // Server-Sent Events transport
POST /api/stdio        // Standard I/O transport
// Handles MCP protocol communication
```

#### **Debug Endpoints** (`/api/debug`)
```typescript
GET /api/debug/vector-search?q={query}
GET /api/debug/database-status
GET /api/debug/ai-models
// Development and debugging endpoints
```

---

## Analytics Implementation

### Vercel Analytics & Speed Insights Integration

The application implements comprehensive analytics and performance monitoring through Vercel's integrated analytics platform.

#### **Analytics Components** (`app/layout.tsx`)
```tsx
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />           {/* User behavior and traffic analytics */}
        <SpeedInsights />       {/* Core Web Vitals and performance metrics */}
      </body>
    </html>
  )
}
```

#### **Analytics Capabilities**

**Vercel Analytics Features:**
- **Page Views**: Track visitor traffic and popular content
- **User Sessions**: Understand user engagement patterns
- **Referrer Tracking**: Identify traffic sources and marketing effectiveness
- **Geographic Analytics**: User location and regional performance insights
- **Device Analytics**: Browser, device, and OS usage patterns

**Speed Insights Features:**
- **Core Web Vitals**: LCP, FID, CLS monitoring and optimization
- **Real User Monitoring (RUM)**: Actual user performance data
- **Performance Insights**: Page load times and optimization recommendations
- **Field Data**: Real-world performance across different devices and networks
- **Lighthouse Integration**: Automated performance auditing

#### **Custom Analytics Integration**

The system also implements custom analytics for AI-specific features:

```typescript
// Conversation analytics from chat.ts
await logConversation(
  userMessage, 
  result.text, 
  "answered", 
  responseTime,
  sessionId,
  modelUsed,
  vectorSources,
  contextUsed
)
```

**Custom Metrics Tracked:**
- AI chat interactions and success rates
- Vector search performance and relevance scores
- User engagement with different portfolio sections
- Admin dashboard usage and content management activities

#### **Privacy & Compliance**

- **GDPR Compliant**: Analytics collection respects user privacy preferences
- **No Personal Data**: User identification is session-based, not personally identifiable
- **Opt-out Capable**: Analytics can be disabled through user preferences
- **Data Retention**: Follows Vercel's data retention policies

---

## Security Considerations

### Authentication & Authorization
- **Admin Access**: Environment-based authentication for admin functions
- **Session Management**: Secure session handling with HTTP-only cookies
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Comprehensive input sanitization with Zod schemas

### Data Protection
- **Database Security**: SSL connections and credential encryption
- **Vector Search**: Secured API tokens for Upstash Vector
- **AI Model Access**: Protected API keys for AI service providers
- **Environment Variables**: Secure configuration management

### Privacy & Compliance
- **User Data**: Minimal collection with optional session tracking
- **Conversation Logs**: Anonymized storage with IP address hashing
- **GDPR Compliance**: Data retention policies and deletion capabilities
- **Analytics**: Privacy-focused metrics without personal identification

### Security Headers & Policies
```typescript
// Next.js security configuration
{
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }
  ]
}
```

---

## Performance & Scalability

### Frontend Optimization
- **React Server Components**: Optimized rendering with minimal client-side JavaScript
- **Image Optimization**: Next.js automatic image optimization and lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Regular bundle size monitoring and optimization

### Backend Performance
- **Database Connection Pooling**: Efficient PostgreSQL connection management
- **Vector Search Caching**: Redis caching for frequent queries
- **API Response Streaming**: Real-time AI response delivery
- **Server Action Optimization**: Minimal data transfer with targeted queries

### Caching Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   CDN           │    │   Application   │
│   Cache         │    │   (Vercel)      │    │   Cache         │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Static assets │    │ • Pages/API     │    │ • Database      │
│ • Images        │    │ • Static files  │    │   queries       │
│ • CSS/JS        │    │ • Images        │    │ • Vector search │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Monitoring & Analytics
- **Vercel Analytics**: Real-time performance and usage metrics for user behavior insights
- **Vercel Speed Insights**: Core Web Vitals monitoring and performance optimization tracking
- **Database Monitoring**: Query performance and connection health
- **AI Model Metrics**: Response times and success rates
- **Error Tracking**: Comprehensive error logging and alerting
- **Custom Analytics**: AI chat interaction metrics and conversation analytics

---

## Deployment Architecture

### Vercel Platform Deployment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Static        │  │   API Routes    │  │   Server        │         │
│  │   Assets        │  │   (Serverless)  │  │   Actions       │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   PostgreSQL    │  │   Upstash       │  │   AI Models     │         │
│  │   (Hosted)      │  │   Vector/Redis  │  │   (Various)     │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Deployment Configuration

#### **Environment Variables**
```bash
# Required
AI_GATEWAY_API_KEY=vck-your_vercel_consumer_key
DATABASE_URL=postgresql://username:password@host:port/database
UPSTASH_VECTOR_REST_URL=https://your-vector-db.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token

# Optional
AI_MODEL=openai/gpt-4o
ADMIN_PASSWORD=secure_admin_password
VERCEL_ANALYTICS_ID=your_analytics_id
```

#### **Build & Deploy Process**
1. **Code Push**: GitHub integration triggers automatic builds
2. **Build Process**: Next.js optimization and type checking
3. **Static Generation**: Pre-rendering of static pages
4. **Serverless Functions**: API routes and Server Actions deployment
5. **Edge Distribution**: Global CDN deployment for optimal performance

#### **Production Monitoring**
- **Uptime Monitoring**: Automated health checks and alerting
- **Performance Metrics**: Core Web Vitals and user experience tracking via Vercel Speed Insights
- **User Analytics**: Real-time usage patterns and behavior insights via Vercel Analytics
- **Error Monitoring**: Real-time error tracking and notification
- **Usage Analytics**: Traffic patterns, feature utilization, and AI chat interaction metrics

---

## Call Flow Diagrams

### Complete AI Chat Interaction Flow

```
User                AI Chat               Vector Search         Database              AI Model
 │                    │                        │                   │                    │
 │ 1. Enter Question  │                        │                   │                    │
 ├──────────────────▶ │                        │                   │                    │
 │                    │ 2. Validate Input      │                   │                    │
 │                    ├────────────┐           │                   │                    │
 │                    │            │           │                   │                    │
 │                    │◀───────────┘           │                   │                    │
 │                    │ 3. Search Context      │                   │                    │
 │                    ├──────────────────────▶ │                   │                    │
 │                    │                        │ 4. Query Embeddings│                   │
 │                    │                        ├─────────────────▶ │                    │
 │                    │                        │                   │ 5. Return Content │
 │                    │                        │ ◀─────────────────┤                   │
 │                    │ 6. Return Context      │                   │                    │
 │                    │ ◀──────────────────────┤                   │                    │
 │                    │ 7. Build Prompt        │                   │                    │
 │                    ├────────────┐           │                   │                    │
 │                    │            │           │                   │                    │
 │                    │◀───────────┘           │                   │                    │
 │                    │ 8. Generate Response   │                   │                    │
 │                    ├──────────────────────────────────────────────────────────────▶ │
 │                    │                        │                   │ 9. Stream Response │
 │                    │ ◀──────────────────────────────────────────────────────────────┤
 │ 10. Display        │                        │                   │                    │
 │     Response       │                        │                   │                    │
 │ ◀──────────────────┤                        │                   │                    │
 │                    │ 11. Log Conversation   │                   │                    │
 │                    ├──────────────────────────────────────────▶ │                    │
 │                    │                        │                   │                    │
```

### Admin Content Management Flow

```
Admin User          Admin Interface        Database               Vector DB
    │                      │                   │                     │
    │ 1. Login             │                   │                     │
    ├────────────────────▶ │                   │                     │
    │                      │ 2. Verify Auth    │                     │
    │                      ├─────────────┐     │                     │
    │                      │             │     │                     │
    │                      │◀────────────┘     │                     │
    │ 3. Access Dashboard  │                   │                     │
    │ ◀────────────────────┤                   │                     │
    │ 4. Edit Content      │                   │                     │
    ├────────────────────▶ │                   │                     │
    │                      │ 5. Validate Data  │                     │
    │                      ├─────────────┐     │                     │
    │                      │             │     │                     │
    │                      │◀────────────┘     │                     │
    │                      │ 6. Update Database│                     │
    │                      ├─────────────────▶ │                     │
    │                      │                   │ 7. Confirm Update  │
    │                      │ ◀─────────────────┤                     │
    │                      │ 8. Sync Embeddings│                     │
    │                      ├───────────────────────────────────────▶ │
    │                      │                   │                     │
    │ 9. Success Feedback  │                   │                     │
    │ ◀────────────────────┤                   │                     │
    │                      │                   │                     │
```

### MCP Server Tool Execution Flow

```
MCP Client          MCP Server            Database              Vector Search
    │                   │                     │                      │
    │ 1. Tool Request   │                     │                      │
    ├─────────────────▶ │                     │                      │
    │                   │ 2. Parse Tool Call  │                      │
    │                   ├───────────┐         │                      │
    │                   │           │         │                      │
    │                   │◀──────────┘         │                      │
    │                   │ 3. Validate Input   │                      │
    │                   ├───────────┐         │                      │
    │                   │           │         │                      │
    │                   │◀──────────┘         │                      │
    │                   │ 4. Execute Query    │                      │
    │                   ├───────────────────▶ │                      │
    │                   │                     │ 5. Return Data      │
    │                   │ ◀───────────────────┤                      │
    │                   │ 6. Optional Vector  │                      │
    │                   │    Search           │                      │
    │                   ├────────────────────────────────────────▶   │
    │                   │                     │                      │
    │                   │ 7. Enhanced Results │                      │
    │                   │ ◀──────────────────────────────────────────┤
    │                   │ 8. Format Response  │                      │
    │                   ├───────────┐         │                      │
    │                   │           │         │                      │
    │                   │◀──────────┘         │                      │
    │ 9. Tool Response  │                     │                      │
    │ ◀─────────────────┤                     │                      │
    │                   │                     │                      │
```

---

## Conclusion

This high-level design document provides a comprehensive overview of the Lewis Perez AI-Powered Portfolio system. The architecture demonstrates a modern, scalable approach to building an intelligent portfolio website that combines traditional web development with cutting-edge AI capabilities.

### Key Design Strengths

1. **Modular Architecture**: Clear separation of concerns with well-defined component boundaries
2. **AI-First Design**: Integrated AI capabilities that enhance rather than replace traditional portfolio elements
3. **Scalable Data Layer**: Robust database design supporting both relational and vector search operations
4. **Developer Experience**: TypeScript throughout, comprehensive documentation, and modern tooling
5. **Production Ready**: Security considerations, monitoring, and deployment optimization

### Future Enhancement Opportunities

1. **Real-time Collaboration**: Multi-user admin capabilities with role-based access
2. **Advanced Analytics**: Machine learning insights on user interactions and content performance
3. **API Expansion**: Public API for third-party integrations and mobile applications
4. **Internationalization**: Multi-language support for global accessibility
5. **Voice Interface**: Voice-based interactions for accessibility and modern user experience

The system successfully balances innovation with reliability, providing a solid foundation for continued development and enhancement.

---

*Document Version: 1.1*  
*Last Updated: September 5, 2025*  
*Author: GitHub Copilot for Lewis Perez*  
*Update: Added Vercel Speed Insights integration and enhanced analytics documentation*