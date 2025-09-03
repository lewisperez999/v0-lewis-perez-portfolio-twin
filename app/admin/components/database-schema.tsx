"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DatabaseSchema() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Schema</CardTitle>
        <CardDescription>View and manage database table structures</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Database schema management coming soon...</p>
      </CardContent>
    </Card>
  )
}