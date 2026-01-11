# Copilot Instructions

> Lewis Perez's Digital Portfolio Twin - AI-powered portfolio with vector search and voice chat.

## Project Context

This is a **Next.js 15** portfolio application featuring:
- GPT-4o-mini powered AI chat with semantic search
- OpenAI Real-time API for voice conversations
- PostgreSQL with pg-vector for RAG
- Clerk authentication for admin dashboard

## Quick Reference

```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # Run linting
```

## Code Conventions

- **TypeScript strict mode** - No `any` without justification
- **Server Components by default** - Only use `'use client'` when needed
- **Zod validation** - All user input must be validated
- **Parameterized queries** - Never concatenate SQL strings
- **`@/` imports** - Use path aliases for all imports

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `app/api/` | API routes |
| `app/actions/` | Server Actions |
| `app/admin/` | Protected admin dashboard |
| `components/` | React components |
| `lib/` | Utilities, database |

## Specialized Agents

For complex tasks, delegate to specialized agents:

| Agent | File | Use For |
|-------|------|---------|
| Test Writer | `.github/agents/test-writer.md` | Writing tests, test patterns |
| Docs Generator | `.github/agents/docs-generator.md` | Documentation, JSDoc, READMEs |
| Security Reviewer | `.github/agents/security-reviewer.md` | Security audits, vulnerability checks |
| Code Reviewer | `.github/agents/code-reviewer.md` | Code quality, best practices |
| Database Expert | `.github/agents/database-expert.md` | Queries, migrations, optimization |

## When to Use Subagents

| Task | Delegate To |
|------|-------------|
| "Add tests for this feature" | test-writer |
| "Document this module" | docs-generator |
| "Check for security issues" | security-reviewer |
| "Review this code" | code-reviewer |
| "Optimize this query" | database-expert |

## Standard Patterns

### API Route
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const Schema = z.object({ field: z.string() });

export async function POST(request: NextRequest) {
  try {
    const body = Schema.parse(await request.json());
    // ... logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Database Query
```typescript
import { query } from '@/lib/database';
const result = await query('SELECT * FROM table WHERE id = $1', [id]);
```

## Before Committing

1. `pnpm lint` - Fix all errors
2. `pnpm build` - Verify production build
3. Test modified API routes manually

## Full Documentation

See [AGENTS.md](../AGENTS.md) for complete project documentation.
