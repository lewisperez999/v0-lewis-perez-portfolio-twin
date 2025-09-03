"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Database, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react"

export function DatabaseOperations() {
  const [query, setQuery] = useState("")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [queryHistory] = useState([
    {
      id: "1",
      query: "SELECT COUNT(*) FROM content_chunks WHERE category = 'experience'",
      result: "23 rows",
      executedAt: "2024-01-15 14:30:00",
      status: "success",
    },
    {
      id: "2",
      query: "SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 10",
      result: "10 rows",
      executedAt: "2024-01-15 14:25:00",
      status: "success",
    },
  ])

  const executeQuery = async () => {
    if (!query.trim()) return

    setIsExecuting(true)
    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setQueryResult({
      rows: [
        { id: 1, name: "Sample Data", created_at: "2024-01-15" },
        { id: 2, name: "Another Row", created_at: "2024-01-14" },
      ],
      rowCount: 2,
      executionTime: "45ms",
    })
    setIsExecuting(false)
  }

  const predefinedQueries = [
    {
      name: "Content Chunks by Category",
      query: "SELECT category, COUNT(*) as count FROM content_chunks GROUP BY category ORDER BY count DESC",
    },
    {
      name: "Recent Chat Sessions",
      query: "SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 20",
    },
    {
      name: "Popular Search Queries",
      query:
        "SELECT query_text, COUNT(*) as frequency FROM search_queries GROUP BY query_text ORDER BY frequency DESC LIMIT 10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Database Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-medium">Connection</h3>
                <p className="text-sm text-muted-foreground">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Tables</h3>
                <p className="text-sm text-muted-foreground">12 active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Last Backup</h3>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Avg Query Time</h3>
                <p className="text-sm text-muted-foreground">23ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Executor */}
      <Card>
        <CardHeader>
          <CardTitle>SQL Query Executor</CardTitle>
          <CardDescription>Execute safe database queries for analysis and maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only SELECT queries are allowed for safety. Use predefined operations for data modifications.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">SQL Query</label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM content_chunks LIMIT 10;"
              className="font-mono text-sm"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={executeQuery} disabled={isExecuting || !query.trim()}>
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? "Executing..." : "Execute Query"}
            </Button>
            <Button variant="outline" onClick={() => setQuery("")}>
              Clear
            </Button>
          </div>

          {queryResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {queryResult.rowCount} rows returned in {queryResult.executionTime}
                </Badge>
              </div>
              <div className="border rounded-md p-4 bg-muted/50">
                <pre className="text-sm overflow-x-auto">{JSON.stringify(queryResult.rows, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predefined Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Common Queries</CardTitle>
          <CardDescription>Frequently used queries for system analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {predefinedQueries.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground font-mono">{item.query}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setQuery(item.query)}>
                  Use Query
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Query History */}
      <Card>
        <CardHeader>
          <CardTitle>Query History</CardTitle>
          <CardDescription>Recent database operations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Executed At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm max-w-xs truncate">{item.query}</TableCell>
                  <TableCell>{item.result}</TableCell>
                  <TableCell>{item.executedAt}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "success" ? "secondary" : "destructive"}>{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
