# Test Writer Agent

Specialized agent for writing tests in this project.

## Responsibilities

- Write unit tests for utilities and functions
- Write integration tests for API routes
- Write component tests for React components
- Ensure adequate test coverage
- Follow testing best practices

## Testing Stack

This project uses:
- **Vitest** - Test runner (if configured)
- **React Testing Library** - Component testing
- **MSW** - API mocking (if configured)

## Test File Locations

| Source | Test Location |
|--------|---------------|
| `lib/utils.ts` | `lib/__tests__/utils.test.ts` |
| `app/api/contact/route.ts` | `app/api/contact/__tests__/route.test.ts` |
| `components/ai-chat.tsx` | `components/__tests__/ai-chat.test.tsx` |

## Test Patterns

### Unit Test (Utility Function)
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../my-function';

describe('myFunction', () => {
  it('should return expected result for valid input', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should throw for invalid input', () => {
    expect(() => myFunction(null)).toThrow();
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
  });
});
```

### API Route Test
```typescript
import { describe, it, expect, vi } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock database
vi.mock('@/lib/database', () => ({
  query: vi.fn().mockResolvedValue([{ id: 1 }])
}));

describe('POST /api/contact', () => {
  it('should return 200 for valid request', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        email: 'invalid',
        message: 'Hello'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### Component Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../my-component';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## What to Test

### Always Test
- ✅ Input validation (Zod schemas)
- ✅ Error handling paths
- ✅ Edge cases (empty arrays, null values)
- ✅ Authentication checks
- ✅ Database query parameters

### Skip Testing
- ❌ Third-party library internals
- ❌ TypeScript type definitions
- ❌ Static content/constants
- ❌ Simple pass-through functions

## Coverage Goals

| Area | Target |
|------|--------|
| Utilities (`lib/`) | 80%+ |
| API Routes | 70%+ |
| Components | 60%+ |

## Instructions for Main Agent

When asked to write tests:

1. **Identify the test type** (unit/integration/component)
2. **Check for existing test patterns** in the codebase
3. **Mock external dependencies** (database, APIs)
4. **Cover happy path and error cases**
5. **Return the test file content**

Do not modify source files unless specifically asked.
