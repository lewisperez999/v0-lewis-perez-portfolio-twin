"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function VectorAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vector Analytics</CardTitle>
        <CardDescription>Analytics for vector embeddings and search performance</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Vector analytics coming soon...</p>
      </CardContent>
    </Card>
  )
}