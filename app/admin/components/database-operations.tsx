"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Database, CheckCircle, AlertCircle, Clock, RefreshCw, Trash2 } from "lucide-react"
import { 
  executeQuery, 
  getDatabaseStats, 
  getQueryHistory, 
  clearQueryHistory,
  getPredefinedQueries,
  type QueryResult,
  type DatabaseStats,
  type QueryHistoryItem 
} from "../actions/database-operations"

export default function DatabaseOperations() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [history, setHistory] = useState<QueryHistoryItem[]>([])
  const [predefinedQueries, setPredefinedQueries] = useState<{name: string, query: string}[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Load initial data
  useEffect(() => {
    loadDatabaseStats()
    loadQueryHistory()
    loadPredefinedQueries()
  }, [])

  const loadDatabaseStats = async () => {
    setIsLoadingStats(true)
    try {
      const statsData = await getDatabaseStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load database stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadQueryHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const historyData = await getQueryHistory()
      setHistory(historyData)
    } catch (error) {
      console.error('Failed to load query history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const loadPredefinedQueries = async () => {
    try {
      const queries = await getPredefinedQueries()
      setPredefinedQueries(queries)
    } catch (error) {
      console.error('Failed to load predefined queries:', error)
    }
  }

  const executeQueryHandler = async () => {
    if (!query.trim()) return
    
    setIsExecuting(true)
    setResult(null)
    
    try {
      const queryResult = await executeQuery(query)
      setResult(queryResult)
      
      // Reload history to show the new query
      await loadQueryHistory()
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: '0ms'
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const clearHistory = async () => {
    try {
      await clearQueryHistory()
      await loadQueryHistory()
    } catch (error) {
      console.error('Failed to clear query history:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const usePredefinedQuery = (predefinedQuery: string) => {
    setQuery(predefinedQuery)
  }

  return (
    <div className="space-y-6">
      {/* Database Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {stats?.connectionStatus === 'healthy' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <h3 className="font-medium">Connection</h3>
                <p className="text-sm text-muted-foreground">
                  {isLoadingStats ? 'Loading...' : stats?.connectionStatus || 'Unknown'}
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {isLoadingStats ? 'Loading...' : `${stats?.tableCount || 0} active`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Total Records</h3>
                <p className="text-sm text-muted-foreground">
                  {isLoadingStats ? 'Loading...' : stats?.totalRecords?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Last Backup</h3>
                <p className="text-sm text-muted-foreground">
                  {isLoadingStats ? 'Loading...' : stats?.lastBackup || 'Unknown'}
                </p>
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
            <Button onClick={executeQueryHandler} disabled={isExecuting || !query.trim()}>
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? "Executing..." : "Execute Query"}
            </Button>
            <Button variant="outline" onClick={() => setQuery("")}>
              Clear
            </Button>
          </div>

          {result && (
            <div className="space-y-2">
              {result.success ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {result.rowCount} rows returned in {result.executionTime}
                    </Badge>
                  </div>
                  <div className="border rounded-md p-4 bg-muted/50">
                    <pre className="text-sm overflow-x-auto">{JSON.stringify(result.data, null, 2)}</pre>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error: {result.error}
                  </AlertDescription>
                </Alert>
              )}
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Query History</CardTitle>
              <CardDescription>Recent database operations</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="text-center py-4 text-muted-foreground">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No query history available</div>
          ) : (
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
                {history.map((item: QueryHistoryItem) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
