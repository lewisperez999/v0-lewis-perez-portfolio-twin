"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Pause, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react"

interface EmbeddingJob {
  id: string
  type: "full_regeneration" | "incremental_update" | "content_chunk" | "cleanup"
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  itemsProcessed: number
  totalItems: number
  startTime?: string
  endTime?: string
  error?: string
}

export function EmbeddingOperations() {
  const [jobs, setJobs] = useState<EmbeddingJob[]>([
    {
      id: "1",
      type: "full_regeneration",
      status: "completed",
      progress: 100,
      itemsProcessed: 156,
      totalItems: 156,
      startTime: "2024-01-15 10:30:00",
      endTime: "2024-01-15 10:35:22",
    },
    {
      id: "2",
      type: "incremental_update",
      status: "running",
      progress: 65,
      itemsProcessed: 13,
      totalItems: 20,
      startTime: "2024-01-15 14:20:00",
    },
  ])

  const [isGenerating, setIsGenerating] = useState(false)

  const startFullRegeneration = async () => {
    setIsGenerating(true)
    // Simulate job creation
    const newJob: EmbeddingJob = {
      id: Date.now().toString(),
      type: "full_regeneration",
      status: "pending",
      progress: 0,
      itemsProcessed: 0,
      totalItems: 156,
      startTime: new Date().toISOString(),
    }
    setJobs([newJob, ...jobs])
    setIsGenerating(false)
  }

  const getStatusIcon = (status: EmbeddingJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: EmbeddingJob["status"]) => {
    const variants = {
      completed: "secondary",
      running: "default",
      failed: "destructive",
      pending: "outline",
    } as const

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={startFullRegeneration}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Full Regeneration</h3>
                <p className="text-sm text-muted-foreground">Rebuild all embeddings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Play className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Incremental Update</h3>
                <p className="text-sm text-muted-foreground">Update changed content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Trash2 className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Cleanup Vectors</h3>
                <p className="text-sm text-muted-foreground">Remove orphaned data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Test Search</h3>
                <p className="text-sm text-muted-foreground">Validate functionality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Current Operations</CardTitle>
          <CardDescription>Active and recent embedding operations</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.filter((job) => job.status === "running").length > 0 && (
            <Alert className="mb-4">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {jobs.filter((job) => job.status === "running").length} operation(s) currently running
              </AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <span className="capitalize">{job.type.replace("_", " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={job.progress} className="w-20" />
                      <span className="text-xs text-muted-foreground">{job.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.itemsProcessed}/{job.totalItems}
                  </TableCell>
                  <TableCell>
                    {job.startTime && (
                      <span className="text-sm">
                        {job.endTime
                          ? `${Math.round(
                              (new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 1000,
                            )}s`
                          : "Running..."}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {job.status === "running" && (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vector Database Status */}
      <Card>
        <CardHeader>
          <CardTitle>Vector Database Status</CardTitle>
          <CardDescription>Current state of the embedding storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Vectors</span>
                <Badge variant="secondary">1,247</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dimensions</span>
                <Badge variant="secondary">1536</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage Used</span>
                <Badge variant="secondary">12.4 MB</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Index Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Query Time</span>
                <span className="text-sm text-muted-foreground">45ms</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Chunks</span>
                <Badge variant="secondary">156</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Categories</span>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Orphaned Vectors</span>
                <Badge variant="secondary">0</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
