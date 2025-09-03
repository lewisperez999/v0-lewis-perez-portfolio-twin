"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Pause, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw, Zap } from "lucide-react"
import { 
  startFullRegeneration, 
  startIncrementalUpdate, 
  startVectorCleanup,
  getEmbeddingJobs,
  getVectorStats,
  testVectorSearch,
  cancelJob,
  deleteJob,
  type EmbeddingJob,
  type VectorStats
} from "../actions/embeddings"

export function EmbeddingOperations() {
  const [jobs, setJobs] = useState<EmbeddingJob[]>([])
  const [vectorStats, setVectorStats] = useState<VectorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Function to restart polling when new jobs are created
  const restartPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
    
    const interval = setInterval(async () => {
      try {
        const currentJobs = await getEmbeddingJobs()
        setJobs(currentJobs)
        
        // Stop polling if no jobs are running
        const hasRunningJobs = currentJobs.some(job => job.status === "running" || job.status === "pending")
        if (!hasRunningJobs) {
          console.log('No running jobs, stopping polling')
          clearInterval(interval)
          setPollingInterval(null)
        }
      } catch (err) {
        console.error('Failed to poll jobs:', err)
      }
    }, 2000) // Poll every 2 seconds for active jobs
    
    setPollingInterval(interval)
  }

  // Load initial data
  useEffect(() => {
    let mounted = true

    const initializeData = async () => {
      try {
        setLoading(true)
        if (mounted) {
          // Load initial data
          const [jobsData] = await Promise.all([loadJobs(), loadVectorStats()])
          
          // Start polling if there are running jobs
          const hasRunningJobs = jobsData.some(job => job.status === "running" || job.status === "pending")
          if (hasRunningJobs) {
            restartPolling()
          }
          
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeData()
    
    return () => {
      mounted = false
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, []) // Empty dependency array to run only once

  const loadJobs = async () => {
    try {
      const fetchedJobs = await getEmbeddingJobs()
      setJobs(fetchedJobs)
      
      // Check if we need to restart polling for new running jobs
      const hasRunningJobs = fetchedJobs.some(job => job.status === "running" || job.status === "pending")
      console.log('Current jobs:', fetchedJobs.length, 'Running:', hasRunningJobs)
      
      return fetchedJobs
    } catch (err) {
      console.error('Failed to load jobs:', err)
      return []
    }
  }

  const loadVectorStats = async () => {
    try {
      const stats = await getVectorStats()
      setVectorStats(stats)
    } catch (err) {
      console.error('Failed to load vector stats:', err)
    }
  }

  const handleFullRegeneration = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      await startFullRegeneration()
      // Restart polling for the new job
      await loadJobs()
      restartPolling()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start full regeneration')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleIncrementalUpdate = async () => {
    try {
      setError(null)
      await startIncrementalUpdate()
      // Restart polling for the new job
      await loadJobs()
      restartPolling()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start incremental update')
    }
  }

  const handleVectorCleanup = async () => {
    try {
      setError(null)
      await startVectorCleanup()
      // Restart polling for the new job
      await loadJobs()
      restartPolling()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start vector cleanup')
    }
  }

  const handleTestSearch = async () => {
    try {
      setError(null)
      const result = await testVectorSearch("software engineer experience")
      alert(`Search test ${result.success ? 'successful' : 'failed'}!\nQuery: "${result.query}"\nResults: ${result.results}${result.error ? `\nError: ${result.error}` : ''}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test search')
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      setError(null)
      await cancelJob(jobId)
      // Refresh jobs immediately for this action
      await loadJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      setError(null)
      await deleteJob(jobId)
      // Refresh jobs immediately for this action
      await loadJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job')
    }
  }

  const handleRefreshStats = async () => {
    try {
      setError(null)
      await loadVectorStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh stats')
    }
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
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="cursor-pointer hover:bg-accent transition-colors" 
          onClick={handleFullRegeneration}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className={`h-8 w-8 text-primary ${isGenerating ? 'animate-spin' : ''}`} />
              <div>
                <h3 className="font-medium">Full Regeneration</h3>
                <p className="text-sm text-muted-foreground">Rebuild all embeddings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={handleIncrementalUpdate}
        >
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

        <Card 
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={handleVectorCleanup}
        >
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

        <Card 
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={handleTestSearch}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-primary" />
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Operations</CardTitle>
              <CardDescription>Active and recent embedding operations</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                await loadJobs()
                const currentJobs = jobs
                const hasRunningJobs = currentJobs.some(job => job.status === "running" || job.status === "pending")
                if (hasRunningJobs && !pollingInterval) {
                  restartPolling()
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelJob(job.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vector Database Status</CardTitle>
              <CardDescription>Current state of the embedding storage</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshStats}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading vector statistics...
            </div>
          ) : vectorStats ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Vectors</span>
                  <Badge variant="secondary">{vectorStats.totalVectors.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dimensions</span>
                  <Badge variant="secondary">{vectorStats.dimensions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Used</span>
                  <Badge variant="secondary">{vectorStats.storageUsed}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(vectorStats.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Index Status</span>
                  <Badge 
                    variant="secondary" 
                    className={
                      vectorStats.indexStatus === "healthy" 
                        ? "bg-green-100 text-green-800" 
                        : vectorStats.indexStatus === "degraded"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {vectorStats.indexStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Query Time</span>
                  <span className="text-sm text-muted-foreground">{vectorStats.averageQueryTime}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Content Chunks</span>
                  <Badge variant="secondary">{vectorStats.contentChunks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Categories</span>
                  <Badge variant="secondary">{vectorStats.categories}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Orphaned Vectors</span>
                  <Badge variant="secondary">{vectorStats.orphanedVectors}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Failed to load vector statistics
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
