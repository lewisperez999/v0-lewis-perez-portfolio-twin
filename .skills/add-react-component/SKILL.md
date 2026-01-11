# Add React Component

Create a new React component following project conventions.

## Description

Creates a new React component with proper TypeScript typing, following Server/Client component patterns.

## Instructions

1. Determine if component needs client interactivity
2. Create file in `components/` directory
3. Add `'use client'` directive only if needed
4. Define props interface
5. Implement component with proper styling
6. Export component

## Parameters

- `component_name` - PascalCase component name
- `is_client` - Whether it needs client-side features (hooks, events)
- `has_props` - Whether the component accepts props
- `uses_ui` - Whether to use shadcn/ui primitives

## Server Component Template

```typescript
// components/my-section.tsx
import { query } from '@/lib/database';

interface MySectionProps {
  title: string;
  className?: string;
}

export async function MySection({ title, className }: MySectionProps) {
  // Can fetch data directly in server components
  const data = await query('SELECT * FROM table');
  
  return (
    <section className={cn("py-12", className)}>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {title}
      </h2>
      <div className="grid gap-4">
        {data.map((item: any) => (
          <div key={item.id} className="p-4 rounded-lg bg-card">
            {item.name}
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Client Component Template

```typescript
// components/interactive-widget.tsx
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InteractiveWidgetProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
  className?: string;
}

export function InteractiveWidget({
  initialValue = 0,
  onValueChange,
  className
}: InteractiveWidgetProps) {
  const [value, setValue] = useState(initialValue);
  
  const handleIncrement = useCallback(() => {
    const newValue = value + 1;
    setValue(newValue);
    onValueChange?.(newValue);
  }, [value, onValueChange]);
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-lg font-medium">{value}</span>
      <Button onClick={handleIncrement} variant="outline" size="sm">
        Increment
      </Button>
    </div>
  );
}
```

## With shadcn/ui Components

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  onLearnMore: () => void;
}

export function ProjectCard({
  title,
  description,
  technologies,
  onLearnMore
}: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech) => (
            <Badge key={tech} variant="secondary">{tech}</Badge>
          ))}
        </div>
        <Button onClick={onLearnMore}>Learn More</Button>
      </CardContent>
    </Card>
  );
}
```

## Best Practices

1. **Server Components by default** - Only use `'use client'` when needed
2. **Type all props** - Use TypeScript interfaces
3. **Use cn() for class merging** - Allows className overrides
4. **Semantic HTML** - Use proper elements (section, article, etc.)
5. **Accessible** - Include ARIA attributes when needed
6. **Use UI primitives** - Build on shadcn/ui components
