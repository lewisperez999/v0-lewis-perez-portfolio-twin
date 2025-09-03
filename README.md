# Lewis Perez AI-Powered Portfolio

*Professional portfolio website with integrated AI chat assistant*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/lewis-perezs-projects/v0-lewis-perez-portfolio)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/UttepYdpR7w)

## 🚀 Features

- **AI-Powered Chat Assistant**: Interactive chat interface with RAG (Retrieval-Augmented Generation)
- **Vector Search Integration**: Semantic search through professional content using Upstash Vector
- **Real-time Streaming Responses**: Powered by Vercel AI SDK with OpenAI GPT-4o
- **Comprehensive Portfolio**: Experience, skills, projects, and contact information
- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Conversation Persistence**: Chat history management with PostgreSQL
- **Source Attribution**: AI responses include relevant source references

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK, OpenAI GPT-4o
- **Vector Database**: Upstash Vector (1024-dimension embeddings)
- **Database**: PostgreSQL with comprehensive professional data schema
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
# Required
OPENAI_API_KEY=sk-proj-your_openai_api_key
DATABASE_URL=postgresql://username:password@host:port/database
UPSTASH_VECTOR_REST_URL=https://your-vector-db.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token

# Optional
GROQ_API_KEY=your_groq_api_key
VERCEL_AI_GATEWAY_URL=your_vercel_ai_gateway_url
\`\`\`

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
