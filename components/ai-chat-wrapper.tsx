'use client'

import { useState, useEffect } from 'react'
import { AIChat } from '@/components/ai-chat'
import { AIChatSkeleton } from '@/components/ui/chat-skeleton'

export function AIChatWrapper() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Simulate initial loading time for a more realistic skeleton experience
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoaded) {
    return <AIChatSkeleton />
  }

  return <AIChat />
}