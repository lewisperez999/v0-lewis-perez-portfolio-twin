"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, RefreshCw, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "success"
  category: string
  message: string
  details?: string
}

export function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [logs] = useState<LogEntry[]>([
    {
      id: "1",
      timestamp: "2024-01-15 14:35:22",
      level: "info",
      category: "chat",
      message: "User query processed successfully",
      details: "Query: 'What is your Java experience?' - Response generated in 245ms",
    },
    {
      id: "2",
      timestamp: "2024-01-15 14:34:15",
      level: "success",
      category: "embedding",
      message: "Vector search completed",
      details: "Found 5 relevant chunks for query about AWS experience",
    },
    {
      id: "3",
      timestamp: "2024-01-15 14:33:08",
      level: "warning",
      category: "api",
      message: "Fallback AI model used",
      details: "Primary Groq API unavailable, using fallback response system",
    },
    {
      id: "4",
      timestamp: "2024-01-15 14:32:45",
      level: "error",
      category: "database",
      message: "Connection timeout",
      details: "PostgreSQL connection timeout after 30s, retrying...",
    },
    {
      id: "5",
      timestamp: "2024-01-15 14:31:30",
      level: "info",
      category: "admin",
      message: "Admin user logged in",
      details: "IP: 192.168.1.100, Session: admin-session-123",
    },
  ])

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLevelBadge = (level: LogEntry["level"]) => {
    const variants = {
      success: "secondary",
      warning: "outline",
      error: "destructive",
      info: "secondary",
    } as const

    const colors = {
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      info: "bg-blue-100 text-blue-800",
    }

    return (
      <Badge variant={variants[level]} className={colors[level]}>
        {level.toUpperCase()}
      </Badge>
    )
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevel === "all" || log.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  return (
    <div className="space-y-6">
      {/* Log Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Info className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Info</h3>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-medium">Warnings</h3>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-medium">Errors</h3>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-medium">Success</h3>
                <p className="text-2xl font-bold">567</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Search Logs</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by message, category, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Logs ({filteredLogs.length})</CardTitle>
          <CardDescription>Real-time system events and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getLevelIcon(log.level)}
                      {getLevelBadge(log.level)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{log.message}</div>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    {log.details && <div className="text-sm text-muted-foreground truncate">{log.details}</div>}
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
