'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { AIChatSkeleton } from '@/components/ui/chat-skeleton'

// Dynamic import with loading state - Priority 2.1: Enhanced Code Splitting
const AIChat = dynamic(() => import('@/components/ai-chat').then(mod => ({ default: mod.AIChat })), {
  loading: () => <AIChatSkeleton />,
  ssr: false, // Client-only component - improves initial bundle size
});

export function AIChatWrapper() {
  return (
    <Suspense fallback={<AIChatSkeleton />}>
      <AIChat />
    </Suspense>
  )
}