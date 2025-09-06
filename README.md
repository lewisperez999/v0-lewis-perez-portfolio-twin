# Lewis Perez AI-Powered Portfolio

*Professional portfolio website with# Optional - AI Chat Configuration
CONVERSATION_LIMIT=6
ENABLE_CONVERSATION_SUMMARY=true
```

### AI Chat Memory Configuration

The AI chat system maintains conversation continuity through intelligent memory management:

**Message Limits:**
- `CONVERSATION_LIMIT` (default: 6) - Number of recent messages kept in full
- Range: 2-50 messages for optimal performance

**Conversation Continuity:**
- `ENABLE_CONVERSATION_SUMMARY=true` - Automatically summarizes older messages
- When conversation exceeds limit, older messages are summarized instead of dropped
- Maintains context without losing conversation history

**How It Works:**
1. Recent messages (within limit) are kept in full detail
2. Older messages are summarized using AI for context preservation
3. Summary is integrated into system prompt for seamless continuity

See [`docs/AI_CHAT_CONFIGURATION.md`](docs/AI_CHAT_CONFIGURATION.md) for detailed configuration options and [`docs/CONVERSATION_CONTINUITY.md`](docs/CONVERSATION_CONTINUITY.md) for continuity management details.I chat assistant*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/lewis-perezs-projects/v0-lewis-perez-portfolio)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/UttepYdpR7w)

## 🚀 Features

- **AI-Powered Chat Assistant**: Interactive chat interface with RAG (Retrieval-Augmented Generation)
- **Vector Search Integration**: Semantic search through professional content using Upstash Vector
- **Real-time Streaming Responses**: Powered by Vercel AI SDK with configurable AI models
- **Comprehensive Portfolio**: Experience, skills, projects, and contact information
- **Contact Form with Email**: Resend API integration with toast notifications for enhanced user feedback
- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Conversation Persistence**: Chat history management with PostgreSQL
- **Source Attribution**: AI responses include relevant source references
- **Configurable AI Models**: Support for multiple AI providers through environment variables

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK with configurable models (default: OpenAI GPT-4o)
- **Vector Database**: Upstash Vector (1024-dimension embeddings)
- **Database**: PostgreSQL with comprehensive professional data schema
- **Email**: Resend API for contact form with Sonner toast notifications
- **Notifications**: Modern toast system for user feedback and status updates
- **Deployment**: Vercel

## 📚 AI Chat Capabilities

The AI assistant can answer questions about:
- Professional experience and career progression
- Technical skills and expertise areas
- Project details and achievements
- Educational background
- Industry knowledge and insights
- Code examples and technical discussions

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database
- OpenAI API key
- Upstash Vector database

### Environment Configuration

1. Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Update `.env.local` with your credentials:
\`\`\`env
# Required - Vercel AI Gateway
AI_GATEWAY_API_KEY=vck-your_vercel_consumer_key
DATABASE_URL=postgresql://username:password@host:port/database
UPSTASH_VECTOR_REST_URL=https://your-vector-db.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token

# Optional - AI Model Configuration
AI_MODEL=openai/gpt-4o

# Optional - Contact Form (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=contact@yourdomain.com
RESEND_TO_EMAIL=your-email@gmail.com

# Optional - AI Chat Configuration
CONVERSATION_LIMIT=6
\`\`\`

### AI Chat Memory Configuration

The `CONVERSATION_LIMIT` environment variable controls how many previous messages the AI chat remembers:

- **Default: 6** - Balanced performance and memory (3 user + 3 AI messages)
- **Range: 2-50** - Minimum 2, maximum 50 messages
- **Impact**: Higher values = better conversation continuity but slower responses and higher costs

See [`docs/AI_CHAT_CONFIGURATION.md`](docs/AI_CHAT_CONFIGURATION.md) for detailed configuration options.

### AI Model Configuration

The `AI_MODEL` environment variable allows you to choose from hundreds of models available through Vercel AI Gateway:

**OpenAI Models:**
- `openai/gpt-4o` (default) - Most capable, balanced performance
- `openai/gpt-4o-mini` - Faster, more cost-effective
- `openai/gpt-4-turbo` - Previous generation flagship

**Anthropic Models:**
- `anthropic/claude-3.5-sonnet` - Excellent reasoning and coding
- `anthropic/claude-3-haiku` - Fast and efficient

**Meta Models:**
- `meta-llama/llama-3.1-70b-instruct` - Open source, strong performance
- `meta-llama/llama-3.1-8b-instruct` - Lighter, faster option

**Other Providers:**
- `google/gemini-1.5-pro` - Google's flagship model
- `mistral/mistral-large` - Mistral's most capable model

Simply change the `AI_MODEL` value and restart your application to switch models.

### Database Setup

1. Create PostgreSQL database
2. Run the schema setup:
\`\`\`bash
psql -d your_database_url -f database/schema.sql
\`\`\`

3. Populate with your professional data (modify scripts in `scripts/database/`)

### Vector Database Setup

1. Create Upstash Vector database with 1024 dimensions
2. Use the scripts in `scripts/database/` to populate embeddings
3. Verify setup with `scripts/database/final-verification.js`

### Contact Form Setup (Optional)

The contact form features modern toast notifications for enhanced user experience:
- **Loading notifications** during form submission
- **Success notifications** with confirmation messages  
- **Error notifications** with specific failure details
- **Form state management** with loading indicators and input validation

Setup steps:
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use test domain for development
3. Add environment variables to `.env.local`:
   ```bash
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM_EMAIL=contact@yourdomain.com
   RESEND_TO_EMAIL=your-email@gmail.com
   ```
4. The contact form will work in fallback mode without these settings

### Local Development

1. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

2. Run development server:
\`\`\`bash
pnpm dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
├── app/
│   ├── actions/
│   │   └── chat.ts              # AI chat server actions
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ai-chat.tsx             # AI chat interface
│   ├── about.tsx               # About section
│   ├── experience.tsx          # Experience timeline
│   ├── projects.tsx            # Projects showcase
│   ├── skills.tsx              # Skills display
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── vector-search.ts        # Vector search utilities
│   ├── types/                  # TypeScript definitions
│   └── utils/                  # Utility functions
├── database/
│   └── schema.sql              # Database schema
├── scripts/
│   └── database/               # Database management scripts
└── data/
    └── sample/                 # Sample data files
\`\`\`

## 🤖 AI Integration Details

### Vector Search System
- **Embedding Model**: OpenAI text-embedding-3-small
- **Dimensions**: 1024
- **Search Strategy**: Hybrid similarity + metadata filtering
- **Content Types**: Experience, skills, projects, education, achievements

### Chat Features
- **Streaming Responses**: Real-time AI response generation
- **Context Retrieval**: RAG system with relevant content injection
- **Conversation Memory**: Maintains chat context and history
- **Source Attribution**: Links responses to original content
- **Suggested Questions**: Dynamic question recommendations
- **Input Validation**: Structured user input processing

### AI Models Supported
- OpenAI GPT-4o (primary)
- Groq API (alternative)
- Vercel AI Gateway (optional)

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds

### Manual Deployment

1. Build the project:
\`\`\`bash
pnpm build
\`\`\`

2. Start production server:
\`\`\`bash
pnpm start
\`\`\`

## 📊 Performance Features

- **Vector Search Optimization**: Efficient similarity search with score filtering
- **Database Connection Pooling**: Optimized PostgreSQL connections
- **Response Streaming**: Real-time AI response delivery
- **Lazy Loading**: Component optimization for better performance
- **Error Handling**: Comprehensive error management and user feedback

## 🔍 Testing & Verification

Run the verification scripts to ensure everything is working:

\`\`\`bash
# Test database connection
node scripts/database/test-db-connection.js

# Verify vector embeddings
node scripts/database/final-verification.js

# Run query examples
node scripts/database/query-examples.js
\`\`\`

## 📖 API Reference

### Chat Actions

- `generateAIResponse(message, history)` - Generate AI response with RAG
- `getSuggestedQuestions()` - Get conversation starter questions
- `searchProfessionalContent(query)` - Search professional content
- `validateUserInput(input)` - Validate and process user input

### Vector Search

- `searchVectors(query, options)` - Semantic vector search
- `getAIChatContext(query)` - Get optimized chat context
- `searchByContentType(query, type)` - Filter search by content type

## 🎯 Customization

To adapt this portfolio for yourself:

1. Update personal information in components
2. Modify database schema with your data
3. Replace vector embeddings with your content
4. Customize AI assistant personality and responses
5. Update styling and branding

## 📄 License

This project is MIT licensed. Feel free to use as a template for your own AI-powered portfolio.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

---

Built with ❤️ using Next.js, TypeScript, and AI
