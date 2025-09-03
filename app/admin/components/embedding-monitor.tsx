"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EmbeddingMonitor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Embedding Monitor</CardTitle>
        <CardDescription>Monitor embedding generation and health status</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Embedding monitoring coming soon...</p>
      </CardContent>
    </Card>
  )
}